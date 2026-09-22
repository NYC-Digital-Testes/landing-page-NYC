import { NextResponse } from "next/server";
import { debugProdutosOfertadosRaw } from "@/lib/crefaz/real";

// Endpoint de debug TEMPORÁRIO — investiga por que uma pré-análise foi
// reprovada sem mensagem no webhook, consultando a Crefaz direto pelo
// crefazPropostaId (não exposto pela API pública do app). Protegido
// comparando ?token= com a própria CREFAZ_API_KEY já configurada em
// produção (evita expor isso publicamente sem precisar de uma env var
// nova, já que não temos acesso ao dashboard da Vercel pra criar uma).
// Remover esse arquivo depois de diagnosticar.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token || token !== process.env.CREFAZ_API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const propostaId = Number(url.searchParams.get("propostaId"));
  if (!propostaId) {
    return NextResponse.json({ error: "propostaId inválido" }, { status: 400 });
  }

  try {
    const raw = await debugProdutosOfertadosRaw(propostaId);
    return NextResponse.json({ propostaId, raw });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 }
    );
  }
}
