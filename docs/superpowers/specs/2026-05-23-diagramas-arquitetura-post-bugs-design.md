# Diagramas de arquitetura no post "Em dev funciona não significa nada"

**Data:** 2026-05-23
**Status:** Draft — aguardando revisão do autor

## Contexto

O post `src/content/blog/em-dev-funciona-nao-significa-nada.md` narra quatro bugs descobertos no primeiro deploy real de um SaaS. Cada bug acontece numa aresta específica da arquitetura (app ASP.NET ↔ MinIO, app ↔ LLM externo, container ↔ filesystem, password manager ↔ env var).

Hoje o post é puro texto. A tese central — "dev é uma simulação útil, prod é a única realidade" — fica mais forte quando o leitor vê **onde no grafo** cada bug ocorreu, especialmente porque o ponto comum de todos é exatamente o tipo de aresta que dev não exercitava.

## Objetivo

Adicionar quatro diagramas (um por seção `## Bug N`) que mostrem, para cada bug, o caminho que o autor esperava que o request percorresse versus o caminho real que ele de fato percorreu.

Não-objetivos:

- Diagrama global da arquitetura no topo do post
- Diagrama de resumo na seção "O denominador comum"
- Refatoração do conteúdo textual do post

## Decisões de design

### Formato: Mermaid renderizado no build

Adicionar `rehype-mermaid` (com `playwright` como peer dep) ao pipeline `markdown.rehypePlugins` em `astro.config.mjs`, configurado com `strategy: 'inline-svg'`.

**Por que:**
- Renderização no build → página final estática, zero JS extra no cliente, sem impacto em LCP/INP no deploy Cloudflare
- Funciona em `.md` (fenced code block ` ```mermaid `) — não precisa converter o post para `.mdx`
- Diagramas ficam versionados como código no próprio post, sem assets binários
- Playwright é apenas devDependency; não vai para o bundle de produção

**Trade-off aceito:** ~150MB de Playwright em `node_modules` localmente e no runner de CI/build do Cloudflare Pages. Aceitável dado o ganho em didática e a manutenibilidade de longo prazo.

### Tema: dois temas sincronizados com o toggle do site

O blog já implementa dual-theme para syntax highlighting (Shiki, commit `76ebb7a`). Os diagramas mermaid devem seguir o mesmo padrão:

- Tema claro: variante `base` do mermaid com paleta correspondente ao tema `github-light`
- Tema escuro: variante `base` com paleta correspondente ao `github-dark-dimmed`
- Troca acionada pelo mesmo seletor de tema que já controla o Shiki

Paleta minimalista, deliberadamente discreta para não brigar com a tipografia IBM Plex Mono:

- **Nós e arestas neutras:** tons de cinza próximos ao texto do corpo
- **Caminho esperado:** linha pontilhada, cor mais clara/desbotada que o texto
- **Caminho real (a falha):** linha sólida com um único accent color (proposta: tom de vermelho/laranja queimado, contrastando em ambos os temas)
- **Marcador de quebra:** ícone ou label inline (`✗`, `reject`, `lost`, etc.) no nó onde o erro se materializa

### Posicionamento

Cada diagrama vai imediatamente após o título da sua seção (`## Bug N: ...`) e antes do parágrafo de abertura que descreve o sintoma. Isso permite que o leitor:

1. Veja o nome do bug
2. Veja o caminho onde ele ocorreu
3. Leia o sintoma sabendo a topologia

### Conteúdo dos quatro diagramas

#### Bug 1 — request indo pra nuvem errada

- **Esperado** (pontilhado): `App ASP.NET → AWS SDK (ServiceURL=minio-interno:9000) → MinIO interno`
- **Real** (sólido, accent): `App → AWS SDK (RegionEndpoint sobrescreve ServiceURL silenciosamente) → AWS S3 público → InvalidAccessKeyId`

A nuance crítica do diagrama: mostrar que a configuração tinha **ambos** `ServiceURL` e `RegionEndpoint`, e que o SDK ignorou um deles sem aviso.

#### Bug 2 — pipeline do SDK bloqueando antes de sair

- **Esperado** (pontilhado): `App → SDK (DisablePayloadSigning=true) → MinIO (HTTP) → 200`
- **Real** (sólido, accent): `App → SDK → [validação interna: PayloadSigning OFF + HTTP ⇒ reject] ✗`

O ponto visual: a falha acontece **dentro do SDK**, antes do request sair do processo. A seta nunca chega ao MinIO.

#### Bug 3 — chave corrompida na origem

- **Esperado** (pontilhado): `Password manager (chave limpa) → variável de ambiente → App → LLM externo → 200`
- **Real** (sólido, accent): `Password manager (chave + lixo invisível) → variável de ambiente (lixo preservado) → App → LLM externo → "API key not valid"`

Detalhe: o nó "Password manager" no caminho real deve sinalizar visualmente o "lixo extra" (label tipo `\n` ou ` ` para evocar caracteres invisíveis).

#### Bug 4 — chaves nascendo a cada deploy (em duas camadas)

Este diagrama é o mais denso por pedido explícito do autor — informação acessível mesmo que custe mais espaço.

- **Esperado** (pontilhado): `Browser (cookie) → App container → DataProtection keys (volume persistente) → token válido ✓`
- **Real, camada 1** (sólido, accent — bug original): `Browser (cookie) → App container → keys em filesystem efêmero do container → docker recreate destrói → token vira lixo criptográfico → 500`
- **Real, camada 2** (sólido, accent secundário — bug em cima do fix): `Browser → App container → volume montado mas com permissão errada → framework tenta gravar, falha → fallback efêmero silencioso → mesma quebra, agora invisível nos logs`

As duas camadas devem aparecer no mesmo diagrama (subgraphs ou agrupamento visual), com uma label clara distinguindo "antes do fix" e "depois da primeira tentativa de fix".

## Componentes da implementação

1. **`astro.config.mjs`** — adicionar `rehype-mermaid` em `markdown.rehypePlugins`, com configuração de tema dual
2. **`package.json`** — adicionar `rehype-mermaid` e `playwright` como devDependencies
3. **`src/content/blog/em-dev-funciona-nao-significa-nada.md`** — inserir quatro fenced code blocks ` ```mermaid ` nas posições especificadas
4. **Theme sync (a definir no plano):** verificar como o toggle do site comunica o tema atual e propagar para o SVG renderizado (provavelmente CSS custom properties + classes no `<html>`, espelhando o padrão Shiki existente em `76ebb7a`)

## Validação

- Build local (`npm run build`) renderiza os quatro diagramas como SVG inline no HTML final
- `npm run dev` renderiza os diagramas no modo de desenvolvimento
- Toggle de tema troca cores dos diagramas em sincronia com o resto do conteúdo
- Lighthouse/PageSpeed do post não regride em LCP, INP ou CLS
- Verificação visual manual em desktop e mobile: diagramas legíveis em ambas as larguras
- Verificação visual em ambos os temas (claro e escuro)

## Riscos e mitigações

- **Playwright em build Cloudflare:** Cloudflare Pages roda o build em ambiente Linux com Chromium disponível, mas vale validar antes do merge. Mitigação: testar com `wrangler dev` localmente e em deploy de preview.
- **Theme sync:** o padrão exato usado pelo Shiki em `76ebb7a` precisa ser inspecionado antes de implementar o equivalente para mermaid. Pode haver detalhes (por ex. CSS variables vs duplicação de SVG) que afetam a implementação.
- **Mobile readability:** diagramas mermaid horizontais podem extrapolar viewport mobile. Mitigação: usar `flowchart TB` (top-bottom) quando o conteúdo permitir, ou habilitar scroll horizontal no container do SVG.
- **Bug 4 ficando complexo demais:** se a versão em duas camadas ficar visualmente carregada, fallback é dividir em dois sub-diagramas verticais dentro da mesma seção.
