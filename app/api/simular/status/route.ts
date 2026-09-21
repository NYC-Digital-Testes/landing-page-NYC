import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCrefazClient } from "@/lib/crefaz";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const proposta = await prisma.propostaCrefaz.findUnique({ where: { id } });
  if (!proposta) {
    return NextResponse.json({ error: "proposta não encontrada" }, { status: 404 });
  }

  // Aprovação na Crefaz só vale para o cliente se o produto Energia estiver
  // entre os ofertados; consignado/outros produtos = negado para este funil.
  // Sem crefazPropostaId (mock) não há o que consultar.
  if (proposta.status === "aprovado" && proposta.crefazPropostaId) {
    try {
      const produtos = await getCrefazClient().listarProdutos(proposta.crefazPropostaId);
      if (!produtos.some((p) => /energia/i.test(p.nome))) {
        const motivo = "Não há oferta disponível para conta de energia no momento.";
        await prisma.propostaCrefaz.update({
          where: { id },
          data: { status: "reprovado", motivoReprovacao: motivo },
        });
        return NextResponse.json({ status: "reprovado", motivoReprovacao: motivo });
      }
    } catch (e) {
      // Falha ao consultar: não libera aprovado sem confirmar; o polling tenta de novo.
      console.error("[status] erro produtos Crefaz", e instanceof Error ? e.message : e);
      return NextResponse.json({ status: "pendente", motivoReprovacao: null });
    }
  }

  return NextResponse.json({
    status: proposta.status,
    motivoReprovacao: proposta.motivoReprovacao,
  });
}
