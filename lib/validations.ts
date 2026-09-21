import { z } from "zod";

export function isCpfValido(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

  const digitoVerificador = (tamanho: number) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(digitos[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    digitoVerificador(9) === Number(digitos[9]) &&
    digitoVerificador(10) === Number(digitos[10])
  );
}

export function maskCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, "");
  return `${"*".repeat(Math.max(digitos.length - 3, 0))}${digitos.slice(-3)}`;
}

export const dadosClienteSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo"),
  cpf: z.string().refine(isCpfValido, "CPF inválido"),
  nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida"),
  telefone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter DDD + número"),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  cidade: z.string().trim().min(2, "Informe a cidade"),
  uf: z.string().length(2, "UF inválida"),
  valorDesejado: z.number().min(300, "Valor mínimo de R$ 300").max(50000, "Valor máximo de R$ 50.000"),
  ocupacaoId: z.number().int().positive("Selecione uma ocupação"),
});

export type DadosCliente = z.infer<typeof dadosClienteSchema>;
