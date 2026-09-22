// Helper central pro dataLayer do GTM. Sem isso, o container até carrega
// (gtm.js dispara em app/layout.tsx), mas nenhum clique/envio de formulário
// gera evento — e sem evento não tem "conversão" pra configurar nas
// plataformas de anúncio (Google Ads, Meta Ads etc.).
export function pushDataLayerEvent(event: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: object[] };
  (w.dataLayer ??= []).push({ event, ...extra });
}
