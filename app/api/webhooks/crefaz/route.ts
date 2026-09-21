import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface WebhookPayload {
  evento: {
    mensagens?: string[];
    detalhes: {
      proposta: {
        id: number;
        aprovado: boolean;
      };
    };
  };
}

export async function POST(req: Request) {
  const body: WebhookPayload | null = await req.json().catch(() => null);
  const proposta = body?.evento?.detalhes?.proposta;

  if (!proposta) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  await prisma.propostaCrefaz.updateMany({
    where: { crefazPropostaId: proposta.id },
    data: {
      status: proposta.aprovado ? "aprovado" : "reprovado",
      motivoReprovacao: proposta.aprovado ? null : body?.evento?.mensagens?.join(" ") ?? null,
    },
  });

  return NextResponse.json({ success: true });
}
