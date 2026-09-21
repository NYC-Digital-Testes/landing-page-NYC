export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "oklch(0.40 0.13 148)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        gap: 16,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-nyc-digital.png"
        alt="NYC Digital"
        style={{ height: 28, display: "block", filter: "brightness(0) invert(1)" }}
      />
      <a
        href="#simulador"
        style={{
          background: "oklch(0.80 0.16 90)",
          color: "oklch(0.25 0.05 90)",
          fontWeight: 700,
          fontSize: 14,
          padding: "10px 20px",
          borderRadius: 8,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Simular agora
      </a>
    </header>
  );
}
