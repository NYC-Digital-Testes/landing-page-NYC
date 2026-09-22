"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Ocupacao } from "@/lib/crefaz/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Etapa =
  | "titular"
  | "emprestimo"
  | "encerrado"
  | "dados"
  | "processando"
  | "aprovado"
  | "reprovado";

// TODO: número real do atendimento de conversão (WhatsApp).
const WHATSAPP_NUMERO = "5511910644163";

// A pré-análise na Crefaz é assíncrona (resultado chega via webhook), então
// fazemos polling do status. 40x a cada 2s = até ~80s de espera.
const POLL_INTERVALO_MS = 2000;
const POLL_MAX_TENTATIVAS = 40;

const GREEN = "oklch(0.52 0.15 148)";
const GREY = "oklch(0.88 0.01 148)";

const botaoPrimario: React.CSSProperties = {
  flex: 1,
  padding: 16,
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 10,
  border: "none",
  background: GREEN,
  color: "white",
  cursor: "pointer",
};

const botaoSecundario: React.CSSProperties = {
  flex: 1,
  padding: 16,
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 10,
  border: `2px solid ${GREY}`,
  background: "white",
  color: "oklch(0.3 0.02 150)",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  color: "oklch(0.4 0.02 150)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  fontSize: 15,
  borderRadius: 9,
  border: `1.5px solid ${GREY}`,
  marginBottom: 16,
};

const FORM_INICIAL = {
  nome: "",
  cpf: "",
  nascimento: "",
  telefone: "",
  cep: "",
  cidade: "",
  uf: "",
  valorDesejado: "3000",
  ocupacaoId: "",
};

const STAGE_LABELS = ["Elegibilidade", "Seus dados", "Análise", "Resultado"];

function stageOf(etapa: Etapa): number {
  if (etapa === "dados") return 1;
  if (etapa === "processando") return 2;
  if (etapa === "aprovado" || etapa === "reprovado") return 3;
  return 0;
}

export default function Funil() {
  const [etapa, setEtapa] = useState<Etapa>("titular");
  const [motivoEncerramento, setMotivoEncerramento] = useState("");
  const [motivoReprovacao, setMotivoReprovacao] = useState("");
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([]);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const cardRef = useRef<HTMLDivElement>(null);

  // No mobile, ao enviar o form o teclado fecha e o card de loading/resultado
  // fica bem mais baixo que o form preenchido — sem isso, a página "sobra"
  // scrollada mais pra baixo do que o card, e o usuário precisa subir pra ver
  // o loading/resultado. Rola o card pro topo visível sempre que entra numa
  // dessas etapas.
  useEffect(() => {
    if (etapa === "processando" || etapa === "aprovado" || etapa === "reprovado" || etapa === "encerrado") {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [etapa]);

  useEffect(() => {
    if (etapa === "dados" && ocupacoes.length === 0) {
      fetch("/api/ocupacoes")
        .then((r) => r.json())
        .then(setOcupacoes)
        .catch(() => setErro("Não foi possível carregar as ocupações."));
    }
  }, [etapa, ocupacoes.length]);

  function responderTitular(sim: boolean) {
    if (!sim) {
      setMotivoEncerramento("Por agora, não conseguimos seguir com essa simulação. Isso não significa que a porta está fechada pra sempre — as condições podem mudar e você pode tentar novamente mais adiante.");
      setEtapa("encerrado");
      return;
    }
    setEtapa("emprestimo");
  }

  function responderEmprestimo(temEmprestimo: boolean) {
    if (temEmprestimo) {
      setMotivoEncerramento("Por agora, não conseguimos seguir com essa simulação. Isso não significa que a porta está fechada pra sempre — as condições podem mudar e você pode tentar novamente mais adiante.");
      setEtapa("encerrado");
      return;
    }
    setEtapa("dados");
  }

  // ViaCEP (API pública); se falhar, o usuário digita cidade/UF manualmente
  async function preencherPorCep(cep: string) {
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) return;
      setForm((f) => ({ ...f, cidade: d.localidade, uf: d.uf }));
    } catch { }
  }

  function atualizarCampo(campo: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function aguardarResultado(proposalId: number) {
    for (let tentativa = 0; tentativa < POLL_MAX_TENTATIVAS; tentativa++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVALO_MS));
      const res = await fetch(`/api/simular/status?id=${proposalId}`);
      if (!res.ok) continue;
      const data = await res.json();

      if (data.status === "aprovado") {
        setEtapa("aprovado");
        return;
      }
      if (data.status === "reprovado") {
        setMotivoReprovacao(data.motivoReprovacao ?? "Não atendemos aos critérios no momento.");
        setEtapa("reprovado");
        return;
      }
    }
    setErro("Sua análise está demorando mais que o esperado. Tente novamente em instantes.");
    setEtapa("dados");
  }

  async function enviarDados(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setNome(form.nome);
    setEtapa("processando");

    try {
      const res = await fetch("/api/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cep: form.cep.replace(/\D/g, ""),
          telefone: form.telefone.replace(/\D/g, ""),
          valorDesejado: Number(form.valorDesejado),
          ocupacaoId: Number(form.ocupacaoId),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const primeiroErro = Object.values(data.error?.fieldErrors ?? {})[0] as string[] | undefined;
        setErro(primeiroErro?.[0] ?? data.message ?? "Revise os dados informados.");
        setEtapa("dados");
        return;
      }

      await aguardarResultado(data.proposalId);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEtapa("dados");
    }
  }

  function onRestart() {
    setForm(FORM_INICIAL);
    setErro("");
    setMotivoEncerramento("");
    setMotivoReprovacao("");
    setEtapa("titular");
  }

  function clickWhatsapp() {
    // Evento de conversão consumido pelo GTM/Google Ads: trigger "Evento personalizado"
    // com o nome conversao_whatsapp_cta.
    const w = window as unknown as { dataLayer?: object[] };
    (w.dataLayer ??= []).push({ event: "conversao_whatsapp_cta" });
    window.dispatchEvent(new CustomEvent("conversao_whatsapp_cta"));
  }

  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Sou ${nome || "cliente"} e fui pré-aprovado(a) no simulador NYC Energia com CPF: ${form.cpf}. Quero saber mais detalhes.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensagemWhatsapp}`;

  const activeStage = stageOf(etapa);

  return (
    <section id="simulador" style={{ background: "oklch(0.94 0.015 148)", padding: "72px 24px" }}>
      <h2
        style={{
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(26px,3vw,34px)",
          textAlign: "center",
          margin: "0 0 12px",
        }}
      >
        Simule seu empréstimo
      </h2>
      <p style={{ textAlign: "center", color: "oklch(0.45 0.02 150)", margin: "0 0 40px", fontSize: 15 }}>
        Leva menos de 2 minutos
      </p>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", maxWidth: 480, margin: "0 auto 36px" }}>
        {STAGE_LABELS.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background: i <= activeStage ? GREEN : GREY,
                  color: i <= activeStage ? "white" : "oklch(0.5 0.02 150)",
                  transition: "background 0.4s ease, color 0.4s ease",
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 11, color: "oklch(0.45 0.02 150)", textAlign: "center", maxWidth: 70 }}>{label}</span>
            </div>
            {i < 3 && (
              <div
                style={{
                  height: 2,
                  flex: 1,
                  background: i < activeStage ? GREEN : GREY,
                  margin: "0 4px",
                  alignSelf: "flex-start",
                  marginTop: 12,
                  transition: "background 0.5s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div
        ref={cardRef}
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 8px 32px oklch(0.3 0.05 148 / 12%)",
          padding: "40px 36px",
          maxWidth: 520,
          margin: "0 auto",
          minHeight: 340,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          scrollMarginTop: 88,
        }}
      >
        {etapa === "titular" && (
          <div data-etapa="etapa-0-titular" style={{ animation: "step-in 0.4s ease-out" }}>
            <h3 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 28px", textAlign: "center" }}>
              Você é o titular da conta de luz?
            </h3>
            <div style={{ display: "flex", gap: 14 }}>
              <button style={botaoPrimario} onClick={() => responderTitular(true)}>Sim</button>
              <button style={botaoSecundario} onClick={() => responderTitular(false)}>Não</button>
            </div>
          </div>
        )}

        {etapa === "emprestimo" && (
          <div data-etapa="etapa-0-emprestimo-ativo" style={{ animation: "step-in 0.4s ease-out" }}>
            <h3 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 10px", textAlign: "center" }}>
              Você já tem algum empréstimo em andamento vinculado à sua conta de energia?
            </h3>
            <p style={{ textAlign: "center", color: "oklch(0.45 0.02 150)", fontSize: 14, margin: "0 0 28px" }}>
              É só pra confirmar que dá pra seguir com uma nova simulação.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <button style={botaoSecundario} onClick={() => responderEmprestimo(true)}>Sim</button>
              <button style={botaoPrimario} onClick={() => responderEmprestimo(false)}>Não</button>
            </div>
          </div>
        )}

        {etapa === "encerrado" && (
          <div style={{ textAlign: "center", animation: "step-in 0.4s ease-out" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "3px solid oklch(0.75 0.05 148)",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "oklch(0.5 0.08 148)",
                fontWeight: 700,
              }}
            >
              i
            </div>
            <h3 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>
              Por agora, não conseguimos seguir com essa simulação
            </h3>
            <p style={{ color: "oklch(0.45 0.02 150)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 28px" }}>{motivoEncerramento}</p>
            <button style={{ ...botaoSecundario, flex: "none", padding: "14px 28px", fontSize: 15 }} onClick={onRestart}>
              Voltar ao início
            </button>
          </div>
        )}

        {etapa === "dados" && (
          <form data-etapa="etapa-1-dados" onSubmit={enviarDados} style={{ animation: "step-in 0.4s ease-out" }}>
            <h3 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 24px", textAlign: "center" }}>
              Só mais alguns dados
            </h3>

            <label style={labelStyle}>CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              required
              inputMode="numeric"
              value={form.cpf}
              onChange={(e) => atualizarCampo(
                "cpf",
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 11)
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
              )
              }
              maxLength={14}
              style={inputStyle}
            />

            <label style={labelStyle}>Nome completo</label>
            <input
              type="text"
              placeholder="Seu nome completo"
              required
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Data de nascimento</label>
                <input
                  type="date"
                  required
                  value={form.nascimento}
                  onChange={(e) => atualizarCampo("nascimento", e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Celular</label>
                <input
                  type="text"
                  placeholder="(11) 90000-0000"
                  required
                  inputMode="numeric"
                  value={form.telefone}
                  maxLength={15}
                  onChange={(e) =>
                    atualizarCampo(
                      "telefone",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11)
                        .replace(/^(\d{2})(\d)/, "($1) $2")
                        .replace(/(\d{5})(\d{1,4})$/, "$1-$2"),
                    )
                  }
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>
            </div>

            <label style={labelStyle}>CEP</label>
            <input
              type="text"
              placeholder="00000-000"
              required
              inputMode="numeric"
              maxLength={9}
              value={form.cep}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                atualizarCampo("cep", d.replace(/(\d{5})(\d)/, "$1-$2"));
                if (d.length === 8) preencherPorCep(d);
              }}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 3 }}>
                <label style={labelStyle}>Cidade</label>
                <input
                  type="text"
                  placeholder="Sua cidade"
                  required
                  value={form.cidade}
                  onChange={(e) => atualizarCampo("cidade", e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>UF</label>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  required
                  value={form.uf}
                  onChange={(e) => atualizarCampo("uf", e.target.value.toUpperCase())}
                  style={{ ...inputStyle, marginBottom: 0, textTransform: "uppercase" }}
                />
              </div>
            </div>

            {/** 
            <label style={labelStyle}>Valor desejado do empréstimo</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1.5px solid ${GREY}`,
                borderRadius: 9,
                padding: "8px 14px",
                marginBottom: 16,
                background: "oklch(0.98 0.006 148)",
              }}
            >
              <span style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700, fontSize: 22, color: "oklch(0.45 0.02 150)", marginRight: 8 }}>
                R$
              </span>
              <input
                type="number"
                min={300}
                max={20000}
                step={100}
                value={form.valorDesejado}
                onChange={(e) => atualizarCampo("valorDesejado", e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 700,
                  fontSize: 26,
                  color: "oklch(0.22 0.02 150)",
                  width: "100%",
                }}
              />
            </div>
            **/}

            <label style={labelStyle}>Ocupação</label>
            <Select
              required
              value={form.ocupacaoId}
              onValueChange={(value) => atualizarCampo("ocupacaoId", value)}
            >
              <SelectTrigger
                className="w-full mb-6"
                style={{ height: 48, borderRadius: 9, fontSize: 15 }}
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ocupacoes.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {erro && (
              <p style={{ color: "oklch(0.5 0.15 30)", fontSize: 14, margin: "0 0 16px", whiteSpace: "pre-line" }}>
                <span className="emoji-feedback--inline" aria-hidden="true">😔</span>
                {erro}
              </p>
            )}

            <button type="submit" style={{ ...botaoPrimario, width: "100%" }}>
              Simular agora
            </button>
          </form>
        )}

        {etapa === "processando" && (
          <div data-etapa="etapa-2-processando" style={{ textAlign: "center", animation: "step-in 0.4s ease-out" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: `4px solid ${GREY}`,
                borderTopColor: GREEN,
                margin: "0 auto 24px",
                animation: "spin 0.9s linear infinite",
              }}
            />
            <h3
              style={{
                fontFamily: "var(--font-poppins), sans-serif",
                fontSize: 20,
                fontWeight: 700,
                margin: "0 0 10px",
                animation: "pulse-fade 1.6s ease-in-out infinite",
              }}
            >
              Consultando sua simulação...
            </h3>
            <p style={{ color: "oklch(0.45 0.02 150)", fontSize: 14.5, margin: 0 }}>
              Estamos verificando as melhores condições com a instituição financeira parceira. Isso pode levar até 2 minutos.
            </p>
          </div>
        )}

        {etapa === "aprovado" && (
          <div data-etapa="etapa-3-aprovado" style={{ textAlign: "center", animation: "step-in 0.4s ease-out" }}>
            <div className="emoji-feedback" aria-hidden="true" style={{ marginBottom: 8 }}>
              🎉😄
            </div>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: GREEN,
                margin: "0 auto 20px",
                position: "relative",
                animation: "check-pulse 1.8s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 19,
                  top: 29,
                  width: 16,
                  height: 9,
                  borderLeft: "3px solid white",
                  borderBottom: "3px solid white",
                  transform: "rotate(-45deg)",
                }}
              />
            </div>
            <h3 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "oklch(0.35 0.1 148)" }}>
              Parabéns! Sua simulação foi pré-aprovada
            </h3>
            <p style={{ color: "oklch(0.45 0.02 150)", fontSize: 15, margin: "0 0 24px", lineHeight: 1.5 }}>
              Clique no botão abaixo e fale com um de nossos especialistas.
              Ele vai consultar as opções e os valores disponíveis para você, de forma simples e sem complicação.

              Para o atendimento, tenha em mãos:
              Sua conta de luz mais recente;
              Seu RG ou CNH.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={clickWhatsapp}
              style={{
                display: "inline-block",
                width: "100%",
                boxSizing: "border-box",
                padding: 16,
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 10,
                background: "oklch(0.58 0.17 152)",
                color: "white",
                textDecoration: "none",
              }}
            >
              Falar com especialista no WhatsApp agora
            </a>
          </div>
        )}

        {etapa === "reprovado" && (
          <div data-etapa="etapa-3-reprovado" style={{ textAlign: "center", animation: "step-in 0.4s ease-out" }}>
            <div className="emoji-feedback" aria-hidden="true" style={{ marginBottom: 8 }}>
              😔
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "3px solid oklch(0.75 0.06 40)",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "oklch(0.5 0.1 40)",
                fontWeight: 700,
              }}
            >
              i
            </div>
            <h3 style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>
              Não foi possível aprovar sua simulação agora
            </h3>
            <p style={{ color: "oklch(0.45 0.02 150)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 28px" }}>{motivoReprovacao}</p>
            <button style={{ ...botaoSecundario, flex: "none", padding: "14px 28px", fontSize: 15 }} onClick={onRestart}>
              Voltar ao início
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
