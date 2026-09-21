import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCrefazClient } from "@/lib/crefaz";

const prisma = new PrismaClient();

// Produtos/ofertas liberados para uma proposta aprovada (id = PropostaCrefaz.id).
export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const proposta = await prisma.propostaCrefaz.findUnique({ where: { id } });
  if (!proposta) return NextResponse.json({ error: "proposta não encontrada" }, { status: 404 });
  if (proposta.status !== "aprovado") {
    return NextResponse.json({ error: "proposta não aprovada" }, { status: 409 });
  }

  try {
    const produtos = await getCrefazClient().listarProdutos(proposta.crefazPropostaId ?? 0);
    return NextResponse.json({ produtos });
  } catch (e) {
    console.error("[produtos] erro Crefaz", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "falha ao consultar produtos" }, { status: 502 });
  }
}
