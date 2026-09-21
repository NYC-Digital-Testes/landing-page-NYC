export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(160deg, oklch(0.40 0.13 148), oklch(0.26 0.09 150))",
        color: "oklch(0.85 0.02 148)",
        padding: "48px 24px 32px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-nyc-digital.png"
          alt="NYC Digital"
          style={{ height: 24, width: "auto", alignSelf: "flex-start", filter: "brightness(0) invert(1)" }}
        />
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 640 }}>
          NYC Digital — CNPJ: 42.972.965/0001-96
          <br />
          Alameda Terracota, 185, São Caetano do Sul, São Paulo, Brasil.
        </p>
        <a href="#" style={{ fontSize: 12.5, color: "oklch(0.85 0.02 148)", textDecoration: "underline" }}>
          Política de Privacidade
        </a>
      </div>
    </footer>
  );
}
