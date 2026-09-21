import Reveal from "./Reveal";

const depoimentos = [
  { quote: "Consegui o dinheiro no mesmo dia e nem precisei sair de casa.", nome: "Marta S.", cidade: "São Caetano do Sul - SP", iniciais: "MS" },
  { quote: "Tava com nome negativado e mesmo assim minha simulação foi aprovada.", nome: "Josué R.", cidade: "Santo André - SP", iniciais: "JR" },
  { quote: "A parcela vem na própria conta de luz, não esqueço de pagar nada separado.", nome: "Cida M.", cidade: "São Paulo - SP", iniciais: "CM" },
];

export default function Depoimentos() {
  return (
    <section style={{ background: "oklch(0.94 0.015 148)", padding: "72px 24px" }}>
      <h2
        style={{
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 700,
          fontSize: "clamp(26px,3vw,34px)",
          textAlign: "center",
          margin: "0 0 44px",
        }}
      >
        Quem já simulou
      </h2>
      <Reveal
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 24,
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {depoimentos.map((d) => (
          <div
            key={d.nome}
            style={{ background: "white", borderRadius: 14, padding: 26, boxShadow: "0 2px 10px oklch(0.3 0.05 148 / 6%)" }}
          >
            <p style={{ fontSize: 14.5, fontStyle: "italic", lineHeight: 1.6, margin: "0 0 18px", color: "oklch(0.3 0.02 150)" }}>
              &quot;{d.quote}&quot;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "oklch(0.52 0.15 148)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {d.iniciais}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{d.nome}</div>
                <div style={{ fontSize: 12, color: "oklch(0.5 0.02 150)" }}>{d.cidade}</div>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
