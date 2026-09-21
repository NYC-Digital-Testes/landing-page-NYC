import type {
  ConsultaCidadeInput,
  ConsultaCidadeResult,
  CrefazClient,
  Ocupacao,
  PreAnaliseInput,
  PreAnaliseResult,
  ProdutoOfertado,
} from "./types";

const OCUPACOES: Ocupacao[] = [
  { id: 1, nome: "Assalariado" },
  { id: 2, nome: "Funcionário Público" },
  { id: 3, nome: "Aposentado" },
  { id: 4, nome: "Pensionista" },
  { id: 5, nome: "Autônomo / Sem Vínculo Empregatício" },
  { id: 6, nome: "Profissional Liberal" },
  { id: 7, nome: "Empresário / Proprietário" },
  { id: 8, nome: "Outros" },
];

export const mockClient: CrefazClient = {
  async listarOcupacoes(): Promise<Ocupacao[]> {
    return OCUPACOES;
  },

  async consultarCidade(_input: ConsultaCidadeInput): Promise<ConsultaCidadeResult> {
    return { cidadeId: 1 };
  },

  async criarPreAnalise(input: PreAnaliseInput): Promise<PreAnaliseResult> {
    // ponytail: regra fake para demo — aprova quando o penúltimo dígito do
    // CPF é par. Substituir pela regra real assim que a API sandbox estiver
    // disponível (Fase 2).
    const digitos = input.cpf.replace(/\D/g, "");
    const aprovado = Number(digitos.at(-2)) % 2 === 0;

    if (!aprovado) {
      return {
        modo: "sincrono",
        aprovado: false,
        motivoReprovacao: "Não atendemos aos critérios de crédito no momento.",
      };
    }

    return { modo: "sincrono", aprovado: true };
  },

  async listarProdutos(): Promise<ProdutoOfertado[]> {
    return [{ id: 1, nome: "Energia (mock)", detalhes: null }];
  },
};
