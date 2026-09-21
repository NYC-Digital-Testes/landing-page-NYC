# NYC Energia — Simulador de Elegibilidade

## Contexto de negócio

Landing page + simulador de elegibilidade do produto "NYC Energia": um
empréstimo pessoal com parcela debitada direto na conta de luz do
cliente. A NYC Digital é a correspondente comercial que capta e qualifica
o lead; a operação de crédito é feita pela Crefaz (instituição financeira
parceira), que também disponibiliza a API usada na simulação.

- Site institucional principal: nycdigital.com.br (WordPress, não tem
  relação técnica com este projeto).
- Este projeto roda em subdomínio isolado: energia.nycdigital.com.br —
  standalone, sem navegação/links para o site institucional.
- Fluxo pós-aprovação (fora do escopo deste projeto): se o cliente é
  aprovado na pré-análise, ele é direcionado ao WhatsApp e um atendente
  humano segue a digitação completa da proposta direto no sistema da
  Crefaz (upload de documentos, seleção de oferta, mesa de crédito, etc).
  Este projeto NÃO implementa nada disso — para exatamente em
  "aprovado/reprovado".

## Escopo funcional

1. Duas perguntas de pré-qualificação locais (sem API): é titular da
   conta de luz? Possui empréstimo em andamento na conta de energia?
   Qualquer "não passa" nessas duas encerra o funil sem chamar a API.
2. Coleta de dados do cliente (CPF, nome, endereço, valor desejado,
   ocupação).
3. Chamada ao backend, que orquestra a API da Crefaz: autenticação
   (token cacheado, validade 12h) → GET ocupações → POST consultar
   cidade → POST criar proposta/pré-análise.
4. A pré-análise é ASSÍNCRONA: a chamada só devolve um `processoId`/
   `propostaId`; o aprovado/reprovado chega depois via webhook (POST em
   `{APP_BASE_URL}/api/webhooks/crefaz`). O front faz polling de
   `GET /api/simular/status?id=` até o status sair de "pendente".
5. Resultado: aprovado → tela de sucesso + CTA WhatsApp (wa.me com
   mensagem pré-preenchida). Reprovado → mensagem explicativa, sem CTA.
   A API não devolve valor/parcelas — a oferta é definida depois,
   manualmente, pelo atendente no WhatsApp.

## Arquitetura e decisões já tomadas

- Stack: Next.js (App Router) + TypeScript + Prisma + PostgreSQL (Neon) +
  Tailwind + Zod. Mesmo padrão dos demais projetos NYC Digital.
- Toda chamada à API da Crefaz acontece no backend (API routes), NUNCA no
  client. Credenciais (login/senha/apiKey) só em variáveis de ambiente.
- Interface `CrefazClient` desacoplada com duas implementações:
  `lib/crefaz/mock.ts` (dados fake, regra simples de aprovação para
  testes) e `lib/crefaz/real.ts` (integração real). Alternado via env var
  `CREFAZ_MODE` (mock | real).
- Token de autenticação persistido em tabela Prisma `TokenCrefaz` (token,
  expiraEm, atualizadoEm) — NÃO em memória, porque funções serverless da
  Vercel são stateless entre invocações (cold starts perderiam o token).
  `getTokenValido()` reaproveita o token salvo se ainda válido (margem de
  ~30min antes de expirar), senão reautentica via POST /usuarios/login.
- Proposta assíncrona rastreada em tabela Prisma `PropostaCrefaz`
  (crefazProcessoId, crefazPropostaId, status: pendente/aprovado/
  reprovado, motivoReprovacao). Criada no POST /api/simular, atualizada
  pelo webhook em POST /api/webhooks/crefaz, lida pelo polling em
  GET /api/simular/status?id=. No mock a resposta já sai resolvida
  (status é gravado direto como aprovado/reprovado, sem passar por
  "pendente").
- CPF mascarado (só 3 últimos dígitos) em qualquer log/console.log,
  inclusive em sandbox.
- A resposta da API Crefaz sempre vem no formato `{success, data,
  errors}` — exceto erros de validação de schema, que vêm como
  problem+json (`{errors: {campo: [msg]}}`). `chamarApi()` em
  `lib/crefaz/real.ts` trata os dois formatos.

## Variáveis de ambiente

```
DATABASE_URL=                # Postgres (Neon em produção)
APP_BASE_URL=                # URL pública desta app, usada no webhook (só CREFAZ_MODE=real)

CREFAZ_LOGIN=
CREFAZ_SENHA=
CREFAZ_API_KEY=
CREFAZ_ENV=sandbox   # ou production
CREFAZ_BASE_URL_SANDBOX=https://api-externo-stag.crefazon.com.br/api/v2
CREFAZ_BASE_URL_PRODUCTION=https://api-externo.crefazon.com.br/api/v2
CREFAZ_MODE=mock     # ou real
```

## Endpoints da API Crefaz usados neste projeto

1. `POST /usuarios/login` — body `{usuario:{login,senha,apiKey}}`.
   Resposta: `data.autenticacao.{token,expira}`. Token válido 12h.
2. `GET /contextos/ocupacoes` (com `Authorization: Bearer <token>`) —
   resposta `data.ocupacao[]` com `{id,nome,ativo}`.
3. `POST /enderecos/cidades` — body `{endereco:{nomeCidade,uf}}`
   (nomeCidade é case-sensitive/acentuado). Resposta:
   `data.endereco[0].cidadeId`.
4. `POST /propostas/pre-analise` — body:
   `{cliente:{cpf,nome,nascimento}, profissional:{ocupacaoId},
   contato:{telefone}, endereco:{cep,cidadeId}, operacao:{urlNotificacao}}`.
   `cep` é STRING apesar de a doc da Crefaz dizer int. Resposta imediata
   só confirma recebimento (`data.processo.id`, `data.proposta.id`); o
   resultado real chega depois via webhook em `urlNotificacao`, payload
   `{evento:{mensagens, detalhes:{proposta:{id,aprovado}}}}`.
   Rejeita proposta duplicada para o mesmo CPF com erro de negócio.
   Não recebe nem devolve valor desejado — a oferta (valor/parcelas) é
   definida depois, manualmente, pelo atendente.

Endpoints seguintes do fluxo completo da Crefaz (produtos-ofertados,
calculo-vencimento, limite-credito, simulacao-credito, tipos-documentos,
upload de imagem, finalizar proposta) existem na API mas ESTÃO FORA DO
ESCOPO deste projeto — são operados manualmente pelo atendente.

**Credenciais atuais são de PRODUÇÃO** (não sandbox) — qualquer teste
manual contra `criarPreAnalise` cria uma proposta real na Crefaz.

## Identidade visual

Popular/acessível, cores vibrantes, foco em urgência e simplicidade
("dinheiro rápido", "sem burocracia"), verde como cor primária (alinhado
à marca NYC Digital). Público inclui pessoas negativadas e sem conta
bancária tradicional — comunicação acolhedora, sem jargão financeiro.

## Rastreamento (integração real fica para depois)

Estrutura já preparada com IDs/data-attributes por etapa do funil
(etapa-0-titular, etapa-0-emprestimo-ativo, etapa-1-dados,
etapa-2-processando, etapa-3-aprovado, etapa-3-reprovado) e evento
customizado no clique do CTA de WhatsApp — este é o evento de conversão
que o Google Ads vai usar para otimizar campanhas, via GTM (tags reais
entram numa fase futura).

## Status atual

- [x] Fase 1: projeto criado, fluxo completo navegável em CREFAZ_MODE=mock.
- [x] Fase 2: `real.ts` implementado e validado contra a API de produção
      da Crefaz (login, ocupações, cidades, pré-análise + webhook).
      Falta configurar `DATABASE_URL` (Neon) e `APP_BASE_URL` públicos
      em produção — hoje só testado com Postgres local via Docker.
- [ ] Fase 3 (futura): deploy em energia.nycdigital.com.br com
      DATABASE_URL/APP_BASE_URL de produção, integração de tags
      (GTM/GA4/Ads/Clarity).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
