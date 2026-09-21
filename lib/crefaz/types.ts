export interface Ocupacao {
  id: number;
  nome: string;
}

export interface ConsultaCidadeInput {
  cidade: string;
  uf: string;
}

export interface ConsultaCidadeResult {
  cidadeId: number;
}

export interface PreAnaliseInput {
  cpf: string;
  nome: string;
  nascimento: string; // YYYY-MM-DD
  telefone: string;
  cep?: string;
  cidadeId: number;
  ocupacaoId: number;
}

// A pré-análise da Crefaz é assíncrona: o modo mock resolve na hora
// ("sincrono"), o modo real só devolve os IDs do processo/proposta
// ("assincrono") — o aprovado/reprovado chega depois via webhook. A API
// não devolve valor/parcelas: a oferta é definida depois, manualmente,
// pelo atendente no WhatsApp.
export type PreAnaliseResult =
  | { modo: "sincrono"; aprovado: boolean; motivoReprovacao?: string }
  | { modo: "assincrono"; processoId: number; propostaId: number };

// GET /propostas/{id}/produtos-ofertados. Só tipamos o essencial; convenio,
// tabelaJuros, orgao etc. vêm em `detalhes` (cru) para uso futuro.
export interface ProdutoOfertado {
  id: number;
  nome: string;
  detalhes: unknown;
}

export interface CrefazClient {
  listarOcupacoes(): Promise<Ocupacao[]>;
  consultarCidade(input: ConsultaCidadeInput): Promise<ConsultaCidadeResult>;
  criarPreAnalise(input: PreAnaliseInput): Promise<PreAnaliseResult>;
  listarProdutos(propostaId: number): Promise<ProdutoOfertado[]>;
}
