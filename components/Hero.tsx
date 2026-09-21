const pills = [
  "De R$ 400 até R$ 4.000",
  "Até 24 parcelas",
  "Pagamento em até 24 horas após a aprovação",
  "Milhares de clientes atendidos",
  "Aprovação rápida",
];

export default function Hero() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, oklch(0.40 0.13 148), oklch(0.26 0.09 150))",
        padding: "64px 24px 56px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-poppins), sans-serif",
          fontWeight: 800,
          color: "white",
          fontSize: "clamp(32px,5vw,52px)",
          lineHeight: 1.1,
          margin: "0 0 18px",
          maxWidth: 820,
          marginInline: "auto",
        }}
      >
        Negativado? Aqui você pode!
      </h1>
      <p
        style={{
          color: "oklch(0.92 0.01 148)",
          fontSize: "clamp(17px,2vw,21px)",
          maxWidth: 600,
          margin: "0 auto 32px",
          lineHeight: 1.5,
        }}
      >
        Empréstimo rápido, com a parcela direto na sua conta de luz. Sem comprovar renda, sem burocracia.
      </p>
      <a
        href="#simulador"
        style={{
          display: "inline-block",
          background: "oklch(0.80 0.16 90)",
          color: "oklch(0.25 0.05 90)",
          fontWeight: 700,
          fontSize: 18,
          padding: "16px 40px",
          borderRadius: 10,
          textDecoration: "none",
          marginBottom: 36,
          animation: "cta-glow 2s ease-in-out infinite",
        }}
      >
        Simular agora, é grátis
      </a>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          flexWrap: "wrap",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {pills.map((texto) => (
          <span
            key={texto}
            style={{
              background: "oklch(0.38 0.08 148)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: 99,
            }}
          >
            {texto}
          </span>
        ))}
      </div>
    </section>
  );
}
