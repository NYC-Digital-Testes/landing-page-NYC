"use client";

import { useState } from "react";

const faqData = [
  { q: "Preciso ser titular da conta de luz?", a: "Sim. Como as parcelas do empréstimo entram direto na sua fatura de energia, é necessário que você seja o titular da conta." },
  { q: "E se eu não pagar a conta de luz?", a: "O empréstimo é cobrado junto com a sua fatura de energia, então é importante manter os pagamentos em dia. Em caso de dificuldade, o ideal é falar com um especialista pelo WhatsApp para entender as opções." },
  { q: "O que eu preciso pra realizar o empréstimo?", list: ["RG/CPF, CNH ou CTPS (carteira de trabalho);", "Uma fatura de energia em seu nome de até 60 dias;", "Fornecimento elétrico ativo no endereço;", "Uma conta bancária no nome do titular da conta de energia."] },
  { q: "Quanto tempo leva pra liberar o dinheiro?", a: "Em até 24 horas úteis depois de assinar o contrato." },
  { q: "É seguro?", a: "Sim. Seus dados são protegidos com criptografia em todas as etapas, e a operação de crédito é feita por uma instituição financeira parceira regulamentada. Depois da simulação, você ainda fala direto com um atendente humano pelo WhatsApp para tirar dúvidas antes de decidir — sem surpresas." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: "72px 24px", maxWidth: 760, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(26px,3vw,34px)",
          textAlign: "center",
          margin: "0 0 40px",
        }}
      >
        Perguntas frequentes
      </h2>
      {faqData.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} style={{ borderBottom: "1.5px solid oklch(0.9 0.01 148)" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "20px 4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                color: "oklch(0.22 0.02 150)",
              }}
            >
              <span>{item.q}</span>
              <span style={{ position: "relative", width: 16, height: 16, flexShrink: 0, marginLeft: 16 }}>
                <span style={{ position: "absolute", top: 7, left: 0, width: 16, height: 2, background: "oklch(0.4 0.05 148)" }} />
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 7,
                    width: 2,
                    height: 16,
                    background: "oklch(0.4 0.05 148)",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                  }}
                />
              </span>
            </button>
            <div
              style={{
                overflow: "hidden",
                maxHeight: isOpen ? (item.list ? 320 : 240) : 0,
                opacity: isOpen ? 1 : 0,
                marginBottom: isOpen ? 20 : 0,
                transition: "max-height 0.35s ease, opacity 0.3s ease, margin-bottom 0.35s ease",
              }}
            >
              {item.list ? (
                <ul style={{ margin: 0, padding: "0 4px 0 24px", fontSize: 14.5, lineHeight: 1.9, color: "oklch(0.45 0.02 150)" }}>
                  {item.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, padding: "0 4px", fontSize: 14.5, lineHeight: 1.6, color: "oklch(0.45 0.02 150)" }}>{item.a}</p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
