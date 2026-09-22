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
        <p style={{ fontSize: 11.5, lineHeight: 1.7, margin: 0, maxWidth: 760, color: "oklch(0.70 0.02 148)" }}>
          Esta página é de propriedade e responsabilidade da NYC Digital S.A. e não possui qualquer vínculo,
          afiliação, patrocínio ou representação da Meta Platforms, Inc., Facebook, Instagram ou WhatsApp. A
          utilização de recursos de comunicação e divulgação segue as diretrizes e requisitos aplicáveis às
          plataformas utilizadas, não significando qualquer associação ou endosso por parte da Meta. A NYC
          Digital S.A., inscrita no CNPJ nº 42.972.965/0001-96, com sede na Alameda Terracota, nº 185, Conjunto
          821, Cerâmica, São Caetano do Sul – SP, CEP 09531-190, atua no segmento de soluções e serviços
          auxiliares do mercado financeiro, realizando intermediação e distribuição de produtos financeiros por
          meio de instituições e parceiros habilitados. As condições apresentadas estão sujeitas à análise,
          aprovação e critérios da instituição responsável pela operação. A contratação, quando aplicável, é
          realizada pelos canais oficiais indicados durante o processo.
        </p>
        <a href="#" style={{ fontSize: 12.5, color: "oklch(0.85 0.02 148)", textDecoration: "underline" }}>
          Política de Privacidade
        </a>
      </div>
    </footer>
  );
}
