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

  // Log do payload cru da Crefaz. Não tem CPF aqui, então vai integral.
  // É a única forma de saber por que uma proposta foi aprovada/reprovada,
  // já que a API não expõe esse histórico depois (só o estado atual).
  console.log("[webhook crefaz] payload recebido:", JSON.stringify(body));

  const proposta = body?.evento?.detalhes?.proposta;

  if (!proposta) {
    console.error("[webhook crefaz] payload inválido, sem evento.detalhes.proposta");
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const status = proposta.aprovado ? "aprovado" : "reprovado";
  const motivoReprovacao = proposta.aprovado ? null : (body?.evento?.mensagens?.join(" ") ?? null);

  console.log("[webhook crefaz] atualizando proposta:", {
    crefazPropostaId: proposta.id,
    status,
    motivoReprovacao,
  });

  const resultado = await prisma.propostaCrefaz.updateMany({
    where: { crefazPropostaId: proposta.id },
    data: { status, motivoReprovacao },
  });

  if (resultado.count === 0) {
    console.error(
      "[webhook crefaz] nenhuma proposta encontrada para crefazPropostaId",
      proposta.id
    );
  }

  return NextResponse.json({ success: true });
}
