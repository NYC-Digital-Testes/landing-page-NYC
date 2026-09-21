import Reveal from "./Reveal";

const passos = [
  { n: 1, titulo: "Simule", desc: "Responda algumas perguntas rápidas e descubra o valor liberado para você." },
  { n: 2, titulo: "Fale com um especialista", desc: "Tire suas dúvidas direto no WhatsApp com um especialista NYC Digital." },
  { n: 3, titulo: "Confirmação e dinheiro em até 24 horas", desc: "Confirme seus dados, assine tudo digitalmente e receba o dinheiro em até 24 horas após a aprovação, isso tudo sem sair de casa!" },
  { n: 4, titulo: "Parcela na conta de luz", desc: "As parcelas entram direto na sua fatura de energia, sem boleto extra e sem burocracia." },
];

export default function ComoFunciona() {
  return (
    <section style={{ padding: "72px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(26px,3vw,34px)",
          textAlign: "center",
          margin: "0 0 44px",
        }}
      >
        Como funciona
      </h2>
      <Reveal style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 32 }}>
        {passos.map((passo) => (
          <div key={passo.n} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "oklch(0.52 0.15 148)",
                color: "white",
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 700,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              {passo.n}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{passo.titulo}</h3>
            <p style={{ fontSize: 14.5, color: "oklch(0.45 0.02 150)", lineHeight: 1.5, margin: 0 }}>{passo.desc}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
