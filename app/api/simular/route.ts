import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCrefazClient } from "@/lib/crefaz";
import { dadosClienteSchema, maskCpf } from "@/lib/validations";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = dadosClienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const dados = parsed.data;
  console.log("[simular] nova solicitação", { cpf: maskCpf(dados.cpf), cidade: dados.cidade, uf: dados.uf });

  const client = getCrefazClient();
  let resultado;
  try {
    const { cidadeId } = await client.consultarCidade({ cidade: dados.cidade, uf: dados.uf });
    resultado = await client.criarPreAnalise({
      cpf: dados.cpf,
      nome: dados.nome,
      nascimento: dados.nascimento,
      telefone: dados.telefone,
      cep: dados.cep,
      cidadeId,
      ocupacaoId: dados.ocupacaoId,
    });
  } catch (e) {
    console.error("[simular] erro Crefaz", e instanceof Error ? e.message : e);
    // Mensagem da Crefaz ("Erro Crefaz [/path]: <detalhe>") repassada ao cliente;
    // detalhe em JSON (validação de schema) é ruído técnico, então cai no genérico.
    const detalhe = e instanceof Error ? e.message.match(/^Erro Crefaz \[[^\]]+\]: (.+)$/)?.[1] : undefined;
    const legivel = detalhe && !/^[{[\d]/.test(detalhe) ? detalhe : undefined;

    // A Crefaz recusa nova simulação quando já existe proposta em aberto pro
    // CPF/cliente. A mensagem crua dela ("verifique em sua esteira...") não faz
    // sentido pro cliente final, que não tem acesso a essa esteira — troca por
    // uma mensagem que indica o caminho certo (falar com o consultor).
    const proposalEmAndamento = legivel && /proposta em andamento|esteira de acompanhamento/i.test(legivel);
    const mensagemFinal = proposalEmAndamento
      ? "Identificamos que você já possui uma proposta em andamento.\nPara consultar o status da sua proposta, entre em contato diretamente com o consultor responsável pelo seu primeiro atendimento."
      : (legivel ?? "Não conseguimos concluir a simulação agora. Tente novamente em instantes.");

    return NextResponse.json({ message: mensagemFinal }, { status: 502 });
  }

  if (resultado.modo === "sincrono") {
    const proposta = await prisma.propostaCrefaz.create({
      data: {
        status: resultado.aprovado ? "aprovado" : "reprovado",
        motivoReprovacao: resultado.motivoReprovacao,
      },
    });
    return NextResponse.json({ proposalId: proposta.id });
  }

  const proposta = await prisma.propostaCrefaz.create({
    data: {
      crefazProcessoId: resultado.processoId,
      crefazPropostaId: resultado.propostaId,
      status: "pendente",
    },
  });
  return NextResponse.json({ proposalId: proposta.id });
}
