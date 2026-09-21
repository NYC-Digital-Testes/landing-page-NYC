import { PrismaClient } from "@prisma/client";
import type {
  ConsultaCidadeInput,
  ConsultaCidadeResult,
  CrefazClient,
  Ocupacao,
  PreAnaliseInput,
  PreAnaliseResult,
  ProdutoOfertado,
} from "./types";

const prisma = new PrismaClient();

const BASE_URL =
  process.env.CREFAZ_ENV === "production"
    ? process.env.CREFAZ_BASE_URL_PRODUCTION
    : process.env.CREFAZ_BASE_URL_SANDBOX;

// Margem de segurança antes da expiração real do token (12h).
const TOKEN_MARGEM_MS = 30 * 60 * 1000;
const TOKEN_CACHE_ID = 1;

interface RespostaApi<T> {
  success: boolean;
  data: T | null;
  errors: string[] | null;
}

async function login(): Promise<{ token: string; expira: Date }> {
  const res = await fetch(`${BASE_URL}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      usuario: {
        login: process.env.CREFAZ_LOGIN,
        senha: process.env.CREFAZ_SENHA,
        apiKey: process.env.CREFAZ_API_KEY,
      },
    }),
  });
  const json: RespostaApi<{ autenticacao: { token: string; expira: string } }> = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(`Falha no login Crefaz: ${json.errors?.join(", ") ?? res.status}`);
  }
  return { token: json.data.autenticacao.token, expira: new Date(json.data.autenticacao.expira) };
}

async function getTokenValido(): Promise<string> {
  const cache = await prisma.tokenCrefaz.findUnique({ where: { id: TOKEN_CACHE_ID } });
  if (cache && cache.expiraEm.getTime() - TOKEN_MARGEM_MS > Date.now()) {
    return cache.token;
  }

  const { token, expira } = await login();
  await prisma.tokenCrefaz.upsert({
    where: { id: TOKEN_CACHE_ID },
    update: { token, expiraEm: expira },
    create: { id: TOKEN_CACHE_ID, token, expiraEm: expira },
  });
  return token;
}

async function chamarApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getTokenValido();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok || !json.success || json.data == null) {
    // A API ora responde {success, errors: string[]}, ora um problem+json
    // com {errors: {campo: string[]}} em validações — normaliza os dois.
    const detalhe = Array.isArray(json.errors)
      ? json.errors.join(", ")
      : json.errors
        ? JSON.stringify(json.errors)
        : res.status;
    throw new Error(`Erro Crefaz [${path}]: ${detalhe}`);
  }
  return json.data as T;
}

export const realClient: CrefazClient = {
  async listarOcupacoes(): Promise<Ocupacao[]> {
    const data = await chamarApi<{ ocupacao: { id: number; nome: string; ativo: boolean }[] }>(
      "/contextos/ocupacoes"
    );
    return data.ocupacao.filter((o) => o.ativo).map(({ id, nome }) => ({ id, nome }));
  },

  async consultarCidade(input: ConsultaCidadeInput): Promise<ConsultaCidadeResult> {
    const data = await chamarApi<{ endereco: { cidadeId: number }[] }>("/enderecos/cidades", {
      method: "POST",
      body: JSON.stringify({ endereco: { nomeCidade: input.cidade, uf: input.uf } }),
    });
    const cidadeId = data.endereco[0]?.cidadeId;
    if (!cidadeId) throw new Error("Cidade não encontrada na base da Crefaz");
    return { cidadeId };
  },

  async criarPreAnalise(input: PreAnaliseInput): Promise<PreAnaliseResult> {
    const appBaseUrl = process.env.APP_BASE_URL;
    if (!appBaseUrl) {
      throw new Error("APP_BASE_URL não configurada (necessária para o webhook de notificação da Crefaz)");
    }

    const data = await chamarApi<{ processo: { id: number }; proposta: { id: number } }>(
      "/propostas/pre-analise",
      {
        method: "POST",
        body: JSON.stringify({
          cliente: {
            cpf: input.cpf.replace(/\D/g, ""),
            nome: input.nome,
            nascimento: input.nascimento,
          },
          profissional: { ocupacaoId: input.ocupacaoId },
          contato: { telefone: input.telefone.replace(/\D/g, "") },
          endereco: {
            cep: input.cep ? input.cep.replace(/\D/g, "") : undefined,
            cidadeId: input.cidadeId,
          },
          operacao: { urlNotificacao: `${appBaseUrl}/api/webhooks/crefaz` },
        }),
      }
    );

    return { modo: "assincrono", processoId: data.processo.id, propostaId: data.proposta.id };
  },

  async listarProdutos(propostaId: number): Promise<ProdutoOfertado[]> {
    const data = await chamarApi<{ produtos: { id: number; nome: string }[] }>(
      `/propostas/${propostaId}/produtos-ofertados`
    );
    return data.produtos.map((p) => ({ id: p.id, nome: p.nome, detalhes: p }));
  },
};
