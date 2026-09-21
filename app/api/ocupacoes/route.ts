import { NextResponse } from "next/server";
import { getCrefazClient } from "@/lib/crefaz";

export async function GET() {
  const ocupacoes = await getCrefazClient().listarOcupacoes();
  return NextResponse.json(ocupacoes);
}
