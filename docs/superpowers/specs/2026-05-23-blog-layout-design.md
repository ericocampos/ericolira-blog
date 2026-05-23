# Blog Layout Redesign — Erico Lira

**Data:** 2026-05-23
**Status:** Draft

## Contexto

O blog é um projeto Astro 6.x baseado no template padrão (Bear Blog default). Hoje tem 1 post, em português, sobre construção de software. A estética atual é genérica (serif Atkinson, accent azul, gradiente cinza no header, hero image placeholder em todo post). O objetivo desta entrega é dar personalidade visual ao blog alinhada à voz do autor: técnico, direto, dev solo construindo SaaS.

## Direção visual

**Terminal puro / dev-first.** IBM Plex Mono em **todos** os elementos (título, corpo, código, navegação). Sem fonte serif/sans. Acento verde fosco:

- Light: `#2d8659`
- Dark: `#7fcf9a`

Estética inspirada em man pages e editores: prompts (`$`), separadores em tracejado (`────`), datas em `YYYY·MM·DD`, labels em uppercase com letter-spacing. Sem placeholders, sem gradientes decorativos.

**Tipografia:**
- Corpo: 17px em viewport `>= 720px`, 16px abaixo. `line-height: 1.65`.
- Coluna de texto do post: 760px (mono pede um pouco mais que sans).
- Pesos usados: 400 (corpo), 500 (UI/labels), 700 (títulos e headings).

## Tema (light/dark)

Toggle no header, com persistência:

1. Primeira visita: respeita `prefers-color-scheme`
2. Após interação: usa `localStorage.theme` (`"light"` | `"dark"`)
3. Script inline no `<head>` antes do `<body>` aplica `data-theme` em `<html>` para evitar flash

Variáveis CSS escopadas:
- `:root` define palette light
- `[data-theme="dark"]` sobrescreve para dark
- `@media (prefers-color-scheme: dark)` aplica dark quando `data-theme` não está setado

## Estrutura de páginas

### Home (`/`)

- Header
- Frase curta de contexto (uma linha sobre o blog)
- Lista de posts no formato **híbrido**:
  - Post mais recente em destaque: bloco com borda esquerda verde, label `ÚLTIMO POST · N MIN`, título grande, descrição, data
  - Posts anteriores em linhas compactas: `MM·DD  Título do post`, agrupados por ano com cabeçalho `2026 ────────`
- Footer

### Página de post (`/blog/[slug]`)

- Barra de progresso fina (2px) fixa no topo da viewport, cor accent
- Header normal
- Grid em duas colunas (>= 960px):
  - **Esquerda (~220px, sticky)**: TOC "Neste post" com `h2` do conteúdo. Item ativo em destaque (cor accent + borda esquerda). Detecção via `IntersectionObserver`.
  - **Centro (~720px)**: data, reading time, título, divisor, conteúdo. Anchor link `#` aparece no `:hover` dos `h2`.
- Em <960px, TOC vira `<details>` collapse acima do conteúdo (fechado por padrão)

### Sobre (`/about`)

Usa BlogPost layout, mas sem TOC e sem barra de progresso (texto curto). Mantém estrutura atual.

### Removido

- `/blog` como página separada (a home agora é a lista). Arquivo `src/pages/blog/index.astro` é deletado. URL canônico dos posts continua `/blog/[slug]`.
- Link "Blog" no header (não tem mais destino separado da home).

## Componentes

### Novos

- `src/components/ThemeToggle.astro` — botão `[ light / dark ]`. Lê/escreve `localStorage.theme`, aplica `data-theme` em `<html>`.
- `src/components/ReadingProgress.astro` — barra fixa no topo. Script inline calcula `scroll % * 100 / article.scrollHeight`. Renderiza só em layout de post.
- `src/components/TableOfContents.astro` — recebe `headings` (de `Astro.props` ou `getHeadings()` da entrada de markdown), renderiza lista de `h2`. `IntersectionObserver` destaca a seção atual com `data-active="true"`.
- `src/components/PostList.astro` — recebe `posts`, renderiza formato híbrido (último em destaque + anteriores compactos agrupados por ano).
- `src/components/ReadingTime.astro` — recebe `body` (string) ou `wordCount`. Retorna `N MIN` (palavras / 220, arredondado pra cima).

### Modificados

- `src/components/Header.astro` — remove link "Blog", adiciona `<ThemeToggle />`. Ícone do GitHub adapta cor ao tema.
- `src/components/Footer.astro` — remove gradiente. Linha simples: `© 2026 Erico Lira · github · rss`.
- `src/components/BaseHead.astro` — substitui `Font` (Atkinson) por IBM Plex Mono via Astro Fonts (weights 400/500/700, italic 400). Adiciona script inline de tema no `<head>`. Se o provider built-in não tiver IBM Plex Mono, fallback: `@fontsource-variable/ibm-plex-mono` via npm.
- `src/layouts/BlogPost.astro` — incorpora `ReadingProgress` + `TableOfContents` em grid. Remove rendering do `heroImage`. Mantém o campo opcional no schema.
- `src/styles/global.css` — reescrito: variáveis CSS para tudo, tipografia base IBM Plex Mono, code blocks com Shiki dual-theme (light/dark) controlado por CSS variable. Selection color em verde fosco.

### Removidos

- `src/pages/blog/index.astro` (home agora é a lista)
- `src/assets/blog-placeholder-1.jpg`, `-2.jpg`, `-3.jpg`, `-4.jpg`, `-5.jpg`, `blog-placeholder-about.jpg` (não usados mais)
- `src/assets/fonts/atkinson-bold.woff`, `atkinson-regular.woff` (substituídos por IBM Plex Mono)

### Schema (`src/content.config.ts`)

Mantém o schema atual. `heroImage` continua opcional. Apenas não é renderizado no BlogPost.

## Responsividade

| Viewport | Comportamento |
|---|---|
| `>= 960px` | Post: TOC sticky lateral. Home: padding generoso, lista com agrupamento por ano. Corpo 17px. |
| `720–959px` | Post: TOC vira `<details>` collapse no topo (fechado por padrão). Home: layout linear. Corpo 17px. |
| `< 720px` | Padding reduzido. Corpo 16px. Lista sem agrupamento por ano (vira lista chapada). |

## Acessibilidade

- Botão de tema: `aria-label="Alternar para tema escuro"` (dinâmico). Atualiza `aria-pressed`.
- TOC: link da seção ativa usa `aria-current="location"`.
- Barra de progresso: `role="progressbar"`, `aria-valuenow` atualizado durante scroll, `aria-label="Progresso de leitura"`.
- Contraste: verde fosco verificado AA em ambos os modos contra os backgrounds (`#fafafa` light, `#0d0d0d` dark — ajustar levemente se contraste falhar).
- Foco visível em todos os elementos interativos (toggle, TOC, links).

## Testes

- `npm run build` precisa passar sem warnings de acessibilidade ou broken links
- Manual em `npm run dev`:
  - Home renderiza com formato híbrido
  - Post renderiza TOC com h2 do conteúdo
  - Toggle alterna sem flash (FOUC test: hard reload em dark deve carregar dark direto)
  - Progress bar atualiza no scroll
  - RSS continua válido (`/rss.xml`)
  - Sitemap continua válido (`/sitemap-index.xml`)
- Lighthouse acessibilidade >= 95 nas páginas principais

## Riscos

- **Conforto de leitura em mono**: IBM Plex Mono tem advance maior que sans. ~3000 palavras em mono pode cansar. Mitigação: ajustar `font-size` do corpo pra 17px e `line-height` pra 1.65–1.7. Se for problema real após uso, considerar revisão futura (não nesta entrega).
- **Largura da coluna**: 720px pode ficar curto demais em mono (poucas palavras por linha). Mitigação: testar com 760–780px na implementação.
- **FOUC do tema**: script inline antes do `<body>` é mandatório. Sem isso, light pisca antes de dark carregar.
- **Astro Fonts + IBM Plex Mono**: se built-in provider não tiver, fallback via `@fontsource-variable/ibm-plex-mono`. Decidir na implementação.
- **Cloudflare Workers build**: redesign não muda runtime nem adapter; deploy continua normal. Verificar `npm run build` (que roda `astro build` + checa Wrangler).

## Fora de escopo

- Paginação (1 post, longe de precisar)
- Busca
- Comentários
- Sistema de tags/categorias
- Página 404 customizada (mantém default do Astro/Cloudflare)
- Imagens decorativas em posts
- Otimização de imagens (não tem mais hero images)
- Redirect de `/blog` (decidiu-se apagar; URL canônico dos posts é `/blog/[slug]`)

## Critério de "pronto"

1. Todas as páginas (`/`, `/blog/[slug]`, `/about`) renderizam com a nova estética
2. Toggle de tema funciona sem flash em hard reload
3. TOC sticky funciona em viewport `>= 960px` e collapse em viewports menores
4. Barra de progresso atualiza no scroll
5. `npm run build` passa
6. Cores do site combinam com paleta definida nos dois modos
7. Posts antigos (1 post atual) renderizam corretamente sem precisar mudar markdown
