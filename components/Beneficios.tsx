import Reveal from "./Reveal";

const beneficios = [
  { titulo: "Aceita negativados", desc: "Nome sujo no CPF não impede sua simulação.", destaque: true },
  { titulo: "Sem comprovação de renda", desc: "Você não precisa apresentar holerite nem extrato bancário.", destaque: false },
  { titulo: "Aprovação rápida", desc: "Resposta em minutos, sem fila de banco.", destaque: false },
  { titulo: "Parcela integrada na fatura", desc: "O valor da parcela já vem somado na sua conta de luz.", destaque: false },
  { titulo: "Sem boletos extras", desc: "Nada de carnê ou boleto separado pra pagar.", destaque: false },
  { titulo: "Atendimento humano", desc: "Fale com uma pessoa de verdade no WhatsApp, sempre que precisar.", destaque: false },
];

export default function Beneficios() {
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
        Por que a NYC Energia
      </h2>
      <Reveal style={{ gap: 28 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {beneficios.map((b) => (
          <div
            key={b.titulo}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              background: b.destaque ? "oklch(0.97 0.05 90)" : "white",
              borderRadius: 12,
              padding: 22,
              boxShadow: "0 2px 10px oklch(0.3 0.05 148 / 6%)",
              border: b.destaque ? "1.5px solid oklch(0.80 0.16 90)" : "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: b.destaque ? "oklch(0.80 0.16 90)" : "oklch(0.9 0.05 148)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 11,
                  top: 15,
                  width: 12,
                  height: 6,
                  borderLeft: `2.5px solid ${b.destaque ? "oklch(0.3 0.05 90)" : "oklch(0.4 0.12 148)"}`,
                  borderBottom: `2.5px solid ${b.destaque ? "oklch(0.3 0.05 90)" : "oklch(0.4 0.12 148)"}`,
                  transform: "rotate(-45deg)",
                }}
              />
            </div>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 4px" }}>{b.titulo}</h3>
              <p style={{ fontSize: 13.5, color: "oklch(0.45 0.02 150)", lineHeight: 1.5, margin: 0 }}>{b.desc}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
