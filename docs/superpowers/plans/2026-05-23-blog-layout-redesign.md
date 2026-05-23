# Blog Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o layout padrão do Astro blog starter por uma estética "terminal puro" (IBM Plex Mono, acento verde, light/dark com toggle), com home que lista posts, TOC sticky nos posts e barra de progresso de leitura.

**Architecture:** Astro 6 SSG → Cloudflare Workers. Sem framework JS extra. Componentes `.astro` puros com scripts inline mínimos para interatividade (theme toggle, progress bar, TOC active state). CSS via variáveis no `:root` com override em `[data-theme="dark"]`. Tipografia única (IBM Plex Mono) via Astro Fonts + Fontsource provider.

**Tech Stack:** Astro 6.3, TypeScript, IBM Plex Mono (Fontsource), Shiki dual-theme, vanilla JS para interatividade.

---

## Spec de referência

`docs/superpowers/specs/2026-05-23-blog-layout-design.md`

## Arquivos afetados (overview)

**Criar:**
- `src/utils/reading-time.ts` — utilitário puro para calcular tempo de leitura
- `src/components/ThemeToggle.astro`
- `src/components/ReadingProgress.astro`
- `src/components/TableOfContents.astro`
- `src/components/PostList.astro`
- `src/components/ReadingTime.astro`

**Modificar:**
- `astro.config.mjs` — substituir provider Atkinson local por IBM Plex Mono via Fontsource + configurar Shiki dual-theme
- `src/styles/global.css` — reescrita completa (palette, variáveis, tipografia mono)
- `src/components/BaseHead.astro` — variável CSS da fonte + script inline de tema
- `src/components/Header.astro` — remover link "Blog", adicionar ThemeToggle
- `src/components/Footer.astro` — simplificar (sem gradiente)
- `src/components/FormattedDate.astro` — formato `YYYY·MM·DD` + variante `compact` (`MM·DD`)
- `src/layouts/BlogPost.astro` — grid com TOC, ReadingProgress, sem hero image
- `src/pages/index.astro` — usar PostList (home vira a lista)

**Deletar:**
- `src/pages/blog/index.astro` — home agora é a lista
- `src/assets/fonts/atkinson-regular.woff`, `atkinson-bold.woff`
- `src/assets/blog-placeholder-1.jpg` ... `blog-placeholder-5.jpg`, `blog-placeholder-about.jpg`

---

## Convenções de verificação

Cada tarefa termina com `npm run build` passando. Para lógica pura (reading time), há um teste rápido via `node --test`. Para mudanças visuais, a verificação inclui inspecionar HTML em `dist/` via `grep` ou rodar `npm run dev` para olhar no navegador (`http://localhost:4321`).

Commits frequentes (um por tarefa). Mensagens em português, estilo do projeto (`chore:`, `feat:`, `refactor:`, `style:`).

---

## Task 1: Trocar fonte Atkinson por IBM Plex Mono

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/components/BaseHead.astro:35`
- Delete: `src/assets/fonts/atkinson-regular.woff`
- Delete: `src/assets/fonts/atkinson-bold.woff`

- [ ] **Step 1: Atualizar astro.config.mjs para usar IBM Plex Mono via Fontsource**

Substitui o bloco `fonts: [...]` em `astro.config.mjs` (linhas 14–37):

```js
fonts: [
  {
    provider: fontProviders.fontsource(),
    name: 'IBM Plex Mono',
    cssVariable: '--font-mono',
    fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    weights: [400, 500, 700],
    styles: ['normal', 'italic'],
  },
],
```

- [ ] **Step 2: Atualizar BaseHead.astro para usar a nova variável**

Em `src/components/BaseHead.astro`, troca a linha 35:

```diff
- <Font cssVariable="--font-atkinson" preload />
+ <Font cssVariable="--font-mono" preload />
```

- [ ] **Step 3: Deletar arquivos da fonte Atkinson**

```bash
rm src/assets/fonts/atkinson-regular.woff
rm src/assets/fonts/atkinson-bold.woff
rmdir src/assets/fonts 2>/dev/null || true
```

- [ ] **Step 4: Build de verificação**

Run: `npm run build`
Expected: build completa sem erro. Output inclui referência ao IBM Plex Mono. Se Astro reclamar de provider não encontrado, o pacote ainda não foi resolvido — Astro Fonts baixa fontsource em runtime; se falhar, instalar manualmente: `npm install @fontsource/ibm-plex-mono`.

- [ ] **Step 5: Verificar HTML gerado contém preload da nova fonte**

Run: `grep -r "ibm-plex-mono\|font-mono" dist/ | head -5`
Expected: pelo menos uma ocorrência (link preload no <head> ou referência em CSS).

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs src/components/BaseHead.astro src/assets/fonts/
git commit -m "feat: troca Atkinson por IBM Plex Mono"
```

---

## Task 2: Reescrever global.css com nova palette e variáveis

**Files:**
- Modify: `src/styles/global.css` (reescrita completa)

- [ ] **Step 1: Substituir conteúdo de src/styles/global.css**

Substitui o arquivo inteiro por:

```css
/*
  Blog Erico Lira — estética "terminal puro".
  Tipografia: IBM Plex Mono em tudo. Acento verde. Light/dark via [data-theme].
 */

:root {
  /* Light palette (default) */
  --bg: #fafafa;
  --bg-elevated: #f0f0ec;
  --text: #1a1a1a;
  --text-muted: #555555;
  --text-faint: #888888;
  --border: #d8d8d0;
  --border-faint: #e8e8e0;
  --accent: #2d8659;
  --accent-bg: rgba(45, 134, 89, 0.08);
  --code-bg: #f0f0ec;
  --selection: rgba(45, 134, 89, 0.25);

  --font-body: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  --content-width: 760px;
  --content-padding: 1.25rem;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0d0d0d;
    --bg-elevated: #181818;
    --text: #eaeaea;
    --text-muted: #999999;
    --text-faint: #666666;
    --border: #262626;
    --border-faint: #1c1c1c;
    --accent: #7fcf9a;
    --accent-bg: rgba(127, 207, 154, 0.10);
    --code-bg: #181818;
    --selection: rgba(127, 207, 154, 0.25);
  }
}

[data-theme="dark"] {
  --bg: #0d0d0d;
  --bg-elevated: #181818;
  --text: #eaeaea;
  --text-muted: #999999;
  --text-faint: #666666;
  --border: #262626;
  --border-faint: #1c1c1c;
  --accent: #7fcf9a;
  --accent-bg: rgba(127, 207, 154, 0.10);
  --code-bg: #181818;
  --selection: rgba(127, 207, 154, 0.25);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--bg);
}

body {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.65;
  color: var(--text);
  background: var(--bg);
  margin: 0;
  padding: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

::selection {
  background: var(--selection);
}

main {
  width: var(--content-width);
  max-width: calc(100% - 2 * var(--content-padding));
  margin: auto;
  padding: 3rem var(--content-padding);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-body);
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 0.5rem 0;
  color: var(--text);
}

h1 { font-size: 1.75rem; }
h2 { font-size: 1.4rem; margin-top: 2.5rem; }
h3 { font-size: 1.15rem; margin-top: 1.75rem; }
h4 { font-size: 1rem; }
h5 { font-size: 0.95rem; }
h6 { font-size: 0.9rem; color: var(--text-muted); }

p {
  margin: 0 0 1.1em 0;
}

a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

a:hover {
  background: var(--accent-bg);
}

strong, b { font-weight: 700; }

hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

code {
  font-family: var(--font-body);
  font-size: 0.92em;
  background: var(--code-bg);
  border: 1px solid var(--border-faint);
  padding: 1px 5px;
  border-radius: 2px;
}

pre {
  background: var(--code-bg);
  border: 1px solid var(--border-faint);
  padding: 1rem 1.25rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.55;
}

pre > code {
  background: transparent;
  border: none;
  padding: 0;
  font-size: inherit;
}

blockquote {
  margin: 1.5rem 0;
  padding: 0.5rem 0 0.5rem 1.25rem;
  border-left: 3px solid var(--accent);
  color: var(--text-muted);
  font-style: italic;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95em;
}

th, td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-faint);
}

th {
  font-weight: 700;
  border-bottom-color: var(--border);
}

ul, ol {
  padding-left: 1.5rem;
}

li {
  margin: 0.25rem 0;
}

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 720px) {
  body { font-size: 16px; }
  main { padding: 1.5rem var(--content-padding); }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
}

.sr-only {
  border: 0;
  padding: 0;
  margin: 0;
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  white-space: nowrap;
}
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa. Pode haver warnings sobre CSS legado nos componentes (vão sumir nas próximas tarefas).

- [ ] **Step 3: Verificar visualmente em dev**

Run: `npm run dev` (em outro terminal)
Abra `http://localhost:4321/`. Esperado: fundo claro/escuro conforme SO, fonte mono em tudo, accent verde nos links. Layout ainda quebrado em alguns pontos (Header, Footer, BlogPost ainda têm CSS antigo) — isso é esperado.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor: reescreve global.css com palette verde e mono"
```

---

## Task 3: Adicionar script anti-FOUC de tema no BaseHead

**Files:**
- Modify: `src/components/BaseHead.astro`

- [ ] **Step 1: Adicionar script inline antes do </head>**

No final do arquivo `src/components/BaseHead.astro` (depois da linha do Twitter image), adiciona:

```astro
<script is:inline>
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      /* localStorage não disponível: respeita prefers-color-scheme via CSS */
    }
  })();
</script>
```

`is:inline` é obrigatório: garante que o script vai pro HTML sem processamento, executando antes do paint.

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa.

- [ ] **Step 3: Verificar que o script está no HTML gerado**

Run: `grep -A 2 "localStorage.getItem('theme')" dist/index.html | head -5`
Expected: encontra o trecho do script no `<head>`.

- [ ] **Step 4: Verificar comportamento manual**

Em `npm run dev`, abrir DevTools → Application → Local Storage. Adicionar `theme=dark`. Hard reload. Esperado: página carrega em dark sem flash claro.

- [ ] **Step 5: Commit**

```bash
git add src/components/BaseHead.astro
git commit -m "feat: adiciona script anti-FOUC para tema light/dark"
```

---

## Task 4: Criar componente ThemeToggle

**Files:**
- Create: `src/components/ThemeToggle.astro`

- [ ] **Step 1: Criar src/components/ThemeToggle.astro**

```astro
---
---
<button
  type="button"
  class="theme-toggle"
  data-theme-toggle
  aria-label="Alternar tema"
>
  <span data-theme-label>theme</span>
</button>

<style>
  .theme-toggle {
    font-family: var(--font-body);
    font-size: 0.85rem;
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: 2px;
    cursor: pointer;
    line-height: 1.2;
  }
  .theme-toggle:hover {
    color: var(--accent);
    border-color: var(--accent);
  }
  .theme-toggle[aria-pressed="true"] {
    color: var(--accent);
  }
</style>

<script is:inline>
  (function() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    var label = btn.querySelector('[data-theme-label]');

    function render(theme) {
      label.textContent = theme === 'dark' ? '[ dark ]' : '[ light ]';
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro');
    }

    var current = document.documentElement.getAttribute('data-theme') || 'light';
    render(current);

    btn.addEventListener('click', function() {
      var next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      render(next);
    });
  })();
</script>
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa.

- [ ] **Step 3: Commit (o toggle será plugado no Header na próxima task)**

```bash
git add src/components/ThemeToggle.astro
git commit -m "feat: adiciona componente ThemeToggle"
```

---

## Task 5: Atualizar Header (remover link Blog, adicionar ThemeToggle)

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Substituir conteúdo de src/components/Header.astro**

```astro
---
import { SITE_TITLE } from '../consts';
import HeaderLink from './HeaderLink.astro';
import ThemeToggle from './ThemeToggle.astro';
---

<header>
  <nav>
    <h2 class="site-title"><a href="/">{SITE_TITLE}</a></h2>
    <div class="links">
      <HeaderLink href="/">início</HeaderLink>
      <HeaderLink href="/about">sobre</HeaderLink>
      <a href="/rss.xml">rss</a>
      <a href="https://github.com/ericocampos" target="_blank" rel="noopener" aria-label="GitHub">github</a>
      <ThemeToggle />
    </div>
  </nav>
</header>

<style>
  header {
    border-bottom: 1px solid var(--border-faint);
    background: var(--bg);
  }
  nav {
    width: var(--content-width);
    max-width: calc(100% - 2 * var(--content-padding));
    margin: 0 auto;
    padding: 1rem var(--content-padding);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .site-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
  }
  .site-title a {
    color: var(--text);
    text-decoration: none;
  }
  .site-title a:hover {
    color: var(--accent);
    background: transparent;
  }
  .links {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    font-size: 0.9rem;
  }
  .links a {
    color: var(--text-muted);
    text-decoration: none;
  }
  .links a:hover,
  .links a.active {
    color: var(--accent);
    background: transparent;
  }
  @media (max-width: 560px) {
    nav { flex-wrap: wrap; gap: 0.5rem; }
    .links { gap: 0.85rem; font-size: 0.85rem; }
  }
</style>
```

Mudanças vs. versão antiga:
- Remove link "Blog" (home agora é a lista)
- Substitui o ícone SVG do GitHub por texto `github`
- Adiciona links `rss` e o `<ThemeToggle />`
- Remove o shadow azul antigo, usa border faint

- [ ] **Step 2: Atualizar HeaderLink se necessário**

`src/components/HeaderLink.astro` já marca `active` quando o pathname bate. Não precisa mudar.

- [ ] **Step 3: Build de verificação**

Run: `npm run build`
Expected: build passa.

- [ ] **Step 4: Verificar visualmente**

`npm run dev`, abrir `/`. Esperado:
- Header com `Erico Lira` à esquerda, links `início · sobre · rss · github · [ light/dark ]` à direita
- Clicar no toggle alterna o tema sem flash
- Hard reload mantém o tema escolhido

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: atualiza Header (remove Blog, adiciona ThemeToggle)"
```

---

## Task 6: Simplificar Footer

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Substituir conteúdo**

```astro
---
const today = new Date();
---
<footer>
  <div class="footer-inner">
    <span>© {today.getFullYear()} Erico Lira</span>
    <span class="dot">·</span>
    <a href="https://github.com/ericocampos" target="_blank" rel="noopener">github</a>
    <span class="dot">·</span>
    <a href="/rss.xml">rss</a>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--border-faint);
    padding: 2rem var(--content-padding);
    color: var(--text-muted);
    font-size: 0.85rem;
  }
  .footer-inner {
    width: var(--content-width);
    max-width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
  footer a {
    color: var(--text-muted);
    text-decoration: none;
  }
  footer a:hover {
    color: var(--accent);
    background: transparent;
  }
  .dot {
    color: var(--text-faint);
  }
</style>
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa. Footer agora é uma linha minimal sem gradiente.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "refactor: simplifica Footer (remove gradiente)"
```

---

## Task 7: Criar utilitário e componente ReadingTime

**Files:**
- Create: `src/utils/reading-time.ts`
- Create: `src/utils/reading-time.test.ts`
- Create: `src/components/ReadingTime.astro`

- [ ] **Step 1: Criar utilitário puro**

`src/utils/reading-time.ts`:

```ts
const WORDS_PER_MINUTE = 220;

/**
 * Calcula tempo de leitura em minutos a partir do markdown body.
 * Retorna no mínimo 1.
 */
export function readingTimeMinutes(body: string): number {
  if (!body) return 1;
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
```

- [ ] **Step 2: Criar teste com node --test**

`src/utils/reading-time.test.ts`:

```ts
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readingTimeMinutes } from './reading-time.ts';

test('retorna 1 minuto para body vazio', () => {
  assert.equal(readingTimeMinutes(''), 1);
});

test('retorna 1 minuto para textos curtos', () => {
  assert.equal(readingTimeMinutes('uma frase curta com poucas palavras.'), 1);
});

test('arredonda pra cima', () => {
  // 221 palavras / 220 ≈ 1.005 → 2 min
  const words = Array(221).fill('palavra').join(' ');
  assert.equal(readingTimeMinutes(words), 2);
});

test('ignora blocos de código markdown', () => {
  const body = '\n```js\n' + Array(500).fill('x').join('\n') + '\n```\n' + 'duas palavras';
  assert.equal(readingTimeMinutes(body), 1);
});
```

- [ ] **Step 3: Rodar teste**

Run: `node --test --experimental-strip-types src/utils/reading-time.test.ts`
Expected: 4 testes passam.

> **Nota:** o flag `--experimental-strip-types` está disponível em Node 22+. O `package.json` já exige `node >= 22.12.0`.

- [ ] **Step 4: Criar componente ReadingTime.astro**

`src/components/ReadingTime.astro`:

```astro
---
import { readingTimeMinutes } from '../utils/reading-time';

interface Props {
  body: string;
}

const { body } = Astro.props;
const minutes = readingTimeMinutes(body);
---
<span class="reading-time">{minutes} MIN</span>

<style>
  .reading-time {
    font-family: var(--font-body);
    color: var(--text-faint);
    font-size: 0.8rem;
    letter-spacing: 0.05em;
  }
</style>
```

- [ ] **Step 5: Build de verificação**

Run: `npm run build`
Expected: build passa (componente ainda não é usado, mas TS deve compilar).

- [ ] **Step 6: Commit**

```bash
git add src/utils/reading-time.ts src/utils/reading-time.test.ts src/components/ReadingTime.astro
git commit -m "feat: adiciona util de reading time + componente"
```

---

## Task 8: Atualizar FormattedDate para formato YYYY·MM·DD

**Files:**
- Modify: `src/components/FormattedDate.astro`

- [ ] **Step 1: Substituir conteúdo**

```astro
---
interface Props {
  date: Date;
  compact?: boolean;
}

const { date, compact = false } = Astro.props;

const yyyy = date.getUTCFullYear();
const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
const dd = String(date.getUTCDate()).padStart(2, '0');

const formatted = compact ? `${mm}·${dd}` : `${yyyy}·${mm}·${dd}`;
---
<time datetime={date.toISOString()}>{formatted}</time>
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa.

- [ ] **Step 3: Verificar formato em HTML gerado**

Run: `grep -o '<time datetime="[^"]*">[^<]*</time>' dist/index.html | head -3`
Expected: cada `<time>` mostra um valor no formato `YYYY·MM·DD` (ou vazio se a home ainda não renderizar datas — verificar após Task 11).

- [ ] **Step 4: Commit**

```bash
git add src/components/FormattedDate.astro
git commit -m "refactor: FormattedDate em YYYY·MM·DD com variante compact"
```

---

## Task 9: Criar componente PostList (formato híbrido)

**Files:**
- Create: `src/components/PostList.astro`

- [ ] **Step 1: Criar src/components/PostList.astro**

```astro
---
import type { CollectionEntry } from 'astro:content';
import FormattedDate from './FormattedDate.astro';
import ReadingTime from './ReadingTime.astro';

interface Props {
  posts: CollectionEntry<'blog'>[];
}

const { posts } = Astro.props;

// Ordena do mais recente pro mais antigo
const sorted = [...posts].sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);

const [featured, ...rest] = sorted;

// Agrupa o resto por ano
const grouped = new Map<number, typeof rest>();
for (const post of rest) {
  const year = post.data.pubDate.getUTCFullYear();
  if (!grouped.has(year)) grouped.set(year, []);
  grouped.get(year)!.push(post);
}
const years = Array.from(grouped.keys()).sort((a, b) => b - a);
---

{
  featured && (
    <article class="featured">
      <div class="featured-meta">
        <span class="label">ÚLTIMO POST</span>
        <span class="dot">·</span>
        <ReadingTime body={featured.body ?? ''} />
      </div>
      <h2 class="featured-title">
        <a href={`/blog/${featured.id}/`}>{featured.data.title}</a>
      </h2>
      <p class="featured-desc">{featured.data.description}</p>
      <div class="featured-date">
        <FormattedDate date={featured.data.pubDate} />
      </div>
    </article>
  )
}

{
  years.length > 0 && (
    <section class="archive">
      {years.map((year) => (
        <div class="year-group">
          <h3 class="year-heading">{year} ────────</h3>
          <ul class="post-list">
            {grouped.get(year)!.map((post) => (
              <li>
                <a href={`/blog/${post.id}/`} class="post-row">
                  <FormattedDate date={post.data.pubDate} compact />
                  <span class="post-title">{post.data.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

<style>
  .featured {
    border-left: 3px solid var(--accent);
    padding: 1rem 0 1rem 1.25rem;
    margin: 2rem 0 3rem 0;
  }
  .featured-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .label {
    color: var(--accent);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
  .dot {
    color: var(--text-faint);
  }
  .featured-title {
    margin: 0.25rem 0 0.5rem 0;
    font-size: 1.5rem;
  }
  .featured-title a {
    color: var(--text);
    text-decoration: none;
  }
  .featured-title a:hover {
    color: var(--accent);
    background: transparent;
  }
  .featured-desc {
    color: var(--text-muted);
    margin: 0 0 0.5rem 0;
  }
  .featured-date {
    color: var(--text-faint);
    font-size: 0.85rem;
  }
  .archive {
    margin-top: 2rem;
  }
  .year-heading {
    font-size: 0.8rem;
    color: var(--text-faint);
    letter-spacing: 0.1em;
    font-weight: 500;
    margin: 2rem 0 0.75rem 0;
  }
  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .post-row {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px dashed var(--border-faint);
    text-decoration: none;
    color: var(--text);
  }
  .post-row time {
    color: var(--text-faint);
    font-size: 0.85rem;
    min-width: 3.5rem;
  }
  .post-row:hover {
    background: transparent;
  }
  .post-row:hover .post-title {
    color: var(--accent);
  }
  .post-title {
    flex: 1;
  }
  @media (max-width: 720px) {
    .featured-title { font-size: 1.25rem; }
    .post-row { gap: 0.65rem; }
  }
</style>
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa. Componente ainda não usado.

- [ ] **Step 3: Commit**

```bash
git add src/components/PostList.astro
git commit -m "feat: adiciona PostList com formato híbrido (destaque + arquivo)"
```

---

## Task 10: Reescrever home page

**Files:**
- Modify: `src/pages/index.astro` (reescrita completa)
- Delete: `src/pages/blog/index.astro`

- [ ] **Step 1: Substituir src/pages/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import PostList from '../components/PostList.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const posts = await getCollection('blog');
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
  </head>
  <body>
    <Header />
    <main>
      <p class="intro">
        Notas sobre construir software e um SaaS solo. Bugs que custam horas, decisões que envelhecem mal, e tudo que sai diferente do plano.
      </p>
      <PostList posts={posts} />
    </main>
    <Footer />
  </body>
</html>

<style>
  .intro {
    color: var(--text-muted);
    margin: 2rem 0 0 0;
    font-size: 1rem;
  }
</style>
```

- [ ] **Step 2: Deletar src/pages/blog/index.astro**

```bash
rm src/pages/blog/index.astro
```

- [ ] **Step 3: Build de verificação**

Run: `npm run build`
Expected: build passa. `dist/index.html` agora lista posts; `dist/blog/` ainda contém `[slug]` mas não tem mais `index.html`.

- [ ] **Step 4: Verificar comportamento**

Run: `grep -c "ÚLTIMO POST" dist/index.html`
Expected: `1` (uma vez na home).

Em `npm run dev`, abrir `/`. Esperado:
- Frase de intro no topo
- Bloco "ÚLTIMO POST · N MIN" com borda esquerda verde, título do post mais recente, descrição, data
- Como só tem 1 post, não há seção de arquivo agrupada por ano

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/blog/index.astro
git commit -m "feat: home agora é a lista de posts"
```

---

## Task 11: Limpar imagens placeholder

**Files:**
- Delete: `src/assets/blog-placeholder-1.jpg` ... `-5.jpg`
- Delete: `src/assets/blog-placeholder-about.jpg`
- Modify: `src/components/BaseHead.astro` (fallback image)

- [ ] **Step 1: Verificar usos**

Run: `grep -rn "blog-placeholder" src/`
Expected: `src/components/BaseHead.astro` referencia `blog-placeholder-1.jpg` como fallback de Open Graph image.

- [ ] **Step 2: Substituir fallback no BaseHead**

Em `src/components/BaseHead.astro`, remover o import do FallbackImage e tornar `image` realmente opcional:

```diff
- import FallbackImage from '../assets/blog-placeholder-1.jpg';
  import { SITE_TITLE } from '../consts';
  ...
  interface Props {
      title: string;
      description: string;
      image?: ImageMetadata;
  }

  const canonicalURL = new URL(Astro.url.pathname, Astro.site);

- const { title, description, image = FallbackImage } = Astro.props;
+ const { title, description, image } = Astro.props;
```

E condicionar as tags `og:image` / `twitter:image` à existência de `image`:

```diff
- <meta property="og:image" content={new URL(image.src, Astro.url)} />
+ {image && <meta property="og:image" content={new URL(image.src, Astro.url)} />}
...
- <meta property="twitter:image" content={new URL(image.src, Astro.url)} />
+ {image && <meta property="twitter:image" content={new URL(image.src, Astro.url)} />}
```

- [ ] **Step 3: Deletar placeholders**

```bash
rm src/assets/blog-placeholder-1.jpg \
   src/assets/blog-placeholder-2.jpg \
   src/assets/blog-placeholder-3.jpg \
   src/assets/blog-placeholder-4.jpg \
   src/assets/blog-placeholder-5.jpg \
   src/assets/blog-placeholder-about.jpg
```

- [ ] **Step 4: Build de verificação**

Run: `npm run build`
Expected: build passa sem warnings de imports quebrados.

Run: `grep -rn "blog-placeholder" src/ dist/ 2>/dev/null`
Expected: nenhuma ocorrência em `src/`. Em `dist/` também não deve haver.

- [ ] **Step 5: Commit**

```bash
git add src/components/BaseHead.astro src/assets/
git commit -m "chore: remove imagens placeholder não usadas"
```

---

## Task 12: Criar TableOfContents (sticky + IntersectionObserver)

**Files:**
- Create: `src/components/TableOfContents.astro`

- [ ] **Step 1: Criar src/components/TableOfContents.astro**

```astro
---
import type { MarkdownHeading } from 'astro';

interface Props {
  headings: MarkdownHeading[];
}

const { headings } = Astro.props;

// Só h2 por enquanto (h3+ pode entrar depois)
const items = headings.filter((h) => h.depth === 2);
---

{
  items.length > 0 && (
    <>
      {/* Desktop sticky */}
      <aside class="toc toc-desktop" aria-label="Sumário do post">
        <p class="toc-title">NESTE POST</p>
        <ol>
          {items.map((h) => (
            <li>
              <a href={`#${h.slug}`} data-toc-link data-slug={h.slug}>
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </aside>

      {/* Mobile collapse */}
      <details class="toc toc-mobile">
        <summary>NESTE POST ({items.length})</summary>
        <ol>
          {items.map((h) => (
            <li>
              <a href={`#${h.slug}`}>{h.text}</a>
            </li>
          ))}
        </ol>
      </details>
    </>
  )
}

<style>
  .toc-title {
    font-size: 0.75rem;
    color: var(--text-faint);
    letter-spacing: 0.1em;
    font-weight: 500;
    margin: 0 0 0.75rem 0;
  }
  .toc ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .toc li {
    margin: 0.4rem 0;
    line-height: 1.35;
  }
  .toc a {
    display: block;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.85rem;
    padding: 2px 0 2px 10px;
    border-left: 2px solid transparent;
  }
  .toc a:hover {
    color: var(--accent);
    background: transparent;
  }
  .toc a[data-active="true"] {
    color: var(--accent);
    border-left-color: var(--accent);
  }

  .toc-desktop {
    display: none;
  }
  .toc-mobile {
    margin: 1rem 0 2rem 0;
    border: 1px solid var(--border-faint);
    border-radius: 2px;
    padding: 0.5rem 0.75rem;
  }
  .toc-mobile summary {
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    font-weight: 500;
  }
  .toc-mobile summary:hover {
    color: var(--accent);
  }

  @media (min-width: 960px) {
    .toc-desktop {
      display: block;
      position: sticky;
      top: 2rem;
      align-self: start;
    }
    .toc-mobile {
      display: none;
    }
  }
</style>

<script is:inline>
  (function() {
    var links = document.querySelectorAll('[data-toc-link]');
    if (!links.length) return;

    var slugToLink = {};
    links.forEach(function(l) { slugToLink[l.dataset.slug] = l; });

    var headings = document.querySelectorAll('article h2[id]');
    if (!headings.length) return;

    var active = null;
    function setActive(slug) {
      if (active === slug) return;
      links.forEach(function(l) { l.removeAttribute('data-active'); });
      var l = slugToLink[slug];
      if (l) {
        l.setAttribute('data-active', 'true');
        active = slug;
      }
    }

    var observer = new IntersectionObserver(function(entries) {
      // Pega o heading mais perto do topo que está visível.
      var visible = entries.filter(function(e) { return e.isIntersecting; });
      if (visible.length === 0) return;
      visible.sort(function(a, b) { return a.target.offsetTop - b.target.offsetTop; });
      setActive(visible[0].target.id);
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    });

    headings.forEach(function(h) { observer.observe(h); });
  })();
</script>
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa. Componente ainda não é usado.

- [ ] **Step 3: Commit**

```bash
git add src/components/TableOfContents.astro
git commit -m "feat: adiciona TableOfContents (sticky desktop + collapse mobile)"
```

---

## Task 13: Criar ReadingProgress (barra fixa no topo)

**Files:**
- Create: `src/components/ReadingProgress.astro`

- [ ] **Step 1: Criar src/components/ReadingProgress.astro**

```astro
---
---
<div
  class="reading-progress"
  role="progressbar"
  aria-label="Progresso de leitura"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="0"
  data-reading-progress
>
  <div class="reading-progress-bar" data-reading-progress-bar></div>
</div>

<style>
  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: transparent;
    z-index: 100;
    pointer-events: none;
  }
  .reading-progress-bar {
    height: 100%;
    width: 0%;
    background: var(--accent);
    transition: width 80ms linear;
  }
</style>

<script is:inline>
  (function() {
    var wrapper = document.querySelector('[data-reading-progress]');
    var bar = document.querySelector('[data-reading-progress-bar]');
    if (!wrapper || !bar) return;

    var article = document.querySelector('article');
    if (!article) return;

    function update() {
      var rect = article.getBoundingClientRect();
      var total = article.offsetHeight - window.innerHeight;
      if (total <= 0) {
        bar.style.width = '100%';
        wrapper.setAttribute('aria-valuenow', '100');
        return;
      }
      var scrolled = Math.max(0, -rect.top);
      var pct = Math.min(100, Math.max(0, Math.round((scrolled / total) * 100)));
      bar.style.width = pct + '%';
      wrapper.setAttribute('aria-valuenow', String(pct));
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  })();
</script>
```

- [ ] **Step 2: Build de verificação**

Run: `npm run build`
Expected: build passa.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReadingProgress.astro
git commit -m "feat: adiciona ReadingProgress (barra fina no topo)"
```

---

## Task 14: Atualizar BlogPost layout (grid com TOC, sem hero image)

**Files:**
- Modify: `src/layouts/BlogPost.astro` (reescrita completa)

- [ ] **Step 1: Substituir conteúdo**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { MarkdownHeading } from 'astro';
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import FormattedDate from '../components/FormattedDate.astro';
import Header from '../components/Header.astro';
import ReadingProgress from '../components/ReadingProgress.astro';
import ReadingTime from '../components/ReadingTime.astro';
import TableOfContents from '../components/TableOfContents.astro';

interface Props extends CollectionEntry<'blog'>['data'] {
  body?: string;
  headings?: MarkdownHeading[];
}

const { title, description, pubDate, updatedDate, body = '', headings = [] } = Astro.props;
const hasH2 = headings.some((h) => h.depth === 2);
const isPost = body.length > 0;
---

<html lang="pt-BR">
  <head>
    <BaseHead title={title} description={description} />
  </head>
  <body>
    {isPost && <ReadingProgress />}
    <Header />
    <main class="post-main">
      <div class={hasH2 ? 'post-grid' : 'post-grid post-grid-no-toc'}>
        {hasH2 && (
          <div class="post-toc">
            <TableOfContents headings={headings} />
          </div>
        )}
        <article class="post-article">
          <header class="post-header">
            <div class="post-meta">
              <FormattedDate date={pubDate} />
              {isPost && (
                <>
                  <span class="dot">·</span>
                  <ReadingTime body={body} />
                </>
              )}
              {updatedDate && (
                <span class="updated">· atualizado em <FormattedDate date={updatedDate} /></span>
              )}
            </div>
            <h1 class="post-title">{title}</h1>
            <hr />
          </header>
          <div class="prose">
            <slot />
          </div>
        </article>
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  .post-main {
    width: 100%;
    max-width: 100%;
    padding: 0;
  }
  .post-grid {
    display: block;
    max-width: var(--content-width);
    margin: 3rem auto;
    padding: 0 var(--content-padding);
  }
  .post-header {
    margin-bottom: 2rem;
  }
  .post-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    color: var(--text-faint);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  .post-meta .dot { color: var(--text-faint); }
  .post-meta .updated { font-style: italic; }
  .post-title {
    margin: 0.5rem 0;
    font-size: 1.85rem;
    line-height: 1.2;
  }
  .post-header hr {
    margin-top: 1.5rem;
  }
  .prose {
    color: var(--text);
  }
  .prose :global(p) {
    margin-bottom: 1.2em;
  }
  /* Anchor link no hover dos h2 */
  .prose :global(h2) {
    position: relative;
  }
  .prose :global(h2 a.heading-anchor) {
    position: absolute;
    left: -1.5rem;
    color: var(--text-faint);
    opacity: 0;
    text-decoration: none;
    font-weight: 400;
  }
  .prose :global(h2:hover a.heading-anchor) {
    opacity: 1;
  }

  @media (min-width: 960px) {
    .post-grid {
      display: grid;
      grid-template-columns: 220px minmax(0, var(--content-width));
      gap: 3rem;
      max-width: calc(var(--content-width) + 220px + 3rem + 2 * var(--content-padding));
    }
    .post-grid-no-toc {
      display: block;
      max-width: var(--content-width);
    }
    .post-toc {
      grid-column: 1;
    }
    .post-article {
      grid-column: 2;
      min-width: 0;
    }
  }
</style>

<script is:inline>
  // Adiciona links de anchor nos h2 que têm id.
  (function() {
    document.querySelectorAll('article h2[id]').forEach(function(h) {
      var a = document.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'Link permanente para ' + h.textContent);
      a.textContent = '#';
      h.insertBefore(a, h.firstChild);
    });
  })();
</script>
```

- [ ] **Step 2: Atualizar a página do post para passar body + headings**

Verificar primeiro a versão atual:

Run: `cat src/pages/blog/\[...slug\].astro`

A versão precisa passar `body` e `headings` pro layout. Substituir o conteúdo de `src/pages/blog/[...slug].astro` por:

```astro
---
import { type CollectionEntry, getCollection, render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}
type Props = CollectionEntry<'blog'>;

const post = Astro.props;
const { Content, headings } = await render(post);
---

<BlogPost {...post.data} body={post.body ?? ''} headings={headings}>
  <Content />
</BlogPost>
```

> **Nota:** a API exata pode variar levemente entre versões do Astro. Em Astro 6, `render(entry)` retorna `{ Content, headings, remarkPluginFrontmatter }`. Se a versão usar `post.render()`, ajustar para essa forma.

- [ ] **Step 3: Atualizar a página About**

`src/pages/about.astro` passa hoje apenas `title`, `description`, `pubDate`. Como o layout agora exige opcionalmente `body`/`headings` (já marcados opcionais com defaults), não precisa mudar — mas o reading time vai mostrar "1 MIN" pra body vazio, o que é OK. Confirmar:

Run: `cat src/pages/about.astro`
Expected: continua passando só os campos atuais. Sem mudanças necessárias.

- [ ] **Step 4: Build de verificação**

Run: `npm run build`
Expected: build passa.

- [ ] **Step 5: Verificar HTML do post**

Run: `grep -c "reading-progress" dist/blog/em-dev-funciona-nao-significa-nada/index.html`
Expected: pelo menos 1 (a barra está no HTML).

Run: `grep -c "data-toc-link" dist/blog/em-dev-funciona-nao-significa-nada/index.html`
Expected: 6 ou mais (um link por h2 do post).

Run: `grep -c "heading-anchor" dist/blog/em-dev-funciona-nao-significa-nada/index.html`
Expected: 0 (anchors são inseridos por script no client; HTML estático só contém o script).

- [ ] **Step 6: Verificar visualmente**

`npm run dev`, abrir `/blog/em-dev-funciona-nao-significa-nada`:
- Barra verde fina no topo, cresce ao rolar
- TOC à esquerda (em viewport ≥960px), seção atual em verde com borda esquerda
- TOC vira `<details>` collapse em viewports menores
- Hover nos `h2` mostra `#` à esquerda do título
- Clicar no `#` ou no link da TOC navega pra seção

- [ ] **Step 7: Commit**

```bash
git add src/layouts/BlogPost.astro src/pages/blog/\[...slug\].astro
git commit -m "feat: BlogPost com TOC sticky, barra de progresso e anchor links"
```

---

## Task 15: Configurar Shiki dual-theme

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Adicionar `markdown.shikiConfig` em astro.config.mjs**

Dentro do `defineConfig({...})`, adicionar (logo após `integrations`):

```js
markdown: {
  shikiConfig: {
    themes: {
      light: 'github-light',
      dark: 'github-dark-dimmed',
    },
  },
},
```

- [ ] **Step 2: Adicionar CSS para o dual-theme funcionar com nosso toggle**

Em `src/styles/global.css`, adicionar antes de `@media (max-width: 720px)`:

```css
/* Shiki dual-theme: alterna por data-theme */
.astro-code,
.astro-code span {
  color: var(--shiki-light) !important;
  background-color: var(--shiki-light-bg) !important;
  font-style: var(--shiki-light-font-style) !important;
  font-weight: var(--shiki-light-font-weight) !important;
  text-decoration: var(--shiki-light-text-decoration) !important;
}

[data-theme="dark"] .astro-code,
[data-theme="dark"] .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .astro-code,
  :root:not([data-theme="light"]) .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
    font-style: var(--shiki-dark-font-style) !important;
    font-weight: var(--shiki-dark-font-weight) !important;
    text-decoration: var(--shiki-dark-text-decoration) !important;
  }
}
```

- [ ] **Step 3: Build de verificação**

Run: `npm run build`
Expected: build passa.

Run: `grep -c "shiki-dark" dist/blog/em-dev-funciona-nao-significa-nada/index.html`
Expected: pelo menos 1 (Shiki inline css vars para o tema dark estão no HTML).

- [ ] **Step 4: Verificar visualmente**

`npm run dev`, abrir o post. Esperado: blocos de código no estilo `github-light` quando em light, `github-dark-dimmed` quando em dark. Toggle alterna sem reload.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/styles/global.css
git commit -m "feat: Shiki dual-theme (github-light/github-dark-dimmed) sincronizado com toggle"
```

---

## Task 16: Verificação final

**Files:** nenhum (validação end-to-end)

- [ ] **Step 1: Build limpo**

```bash
rm -rf dist .astro
npm run build
```

Expected: build completa sem erros nem warnings significativos.

- [ ] **Step 2: Conferir páginas geradas**

Run: `ls dist/ dist/blog/`
Expected:
- `dist/index.html`
- `dist/about/index.html`
- `dist/blog/em-dev-funciona-nao-significa-nada/index.html`
- `dist/rss.xml`
- `dist/sitemap-index.xml`
- **NÃO** deve existir `dist/blog/index.html` (a página /blog foi removida na Task 10)

- [ ] **Step 3: Conferir referências ortográficas/integridade**

Run: `grep -rn "atkinson\|blog-placeholder" dist/ src/`
Expected: nenhuma ocorrência.

- [ ] **Step 4: Checklist manual no navegador**

Subir `npm run dev` e validar:

- [ ] Home (`/`): intro + bloco "ÚLTIMO POST" com borda esquerda verde
- [ ] Hard reload em dark (DevTools → Application → localStorage → `theme=dark`) carrega sem flash claro
- [ ] Toggle no header alterna light↔dark sem reload
- [ ] Hard reload mantém o tema escolhido
- [ ] Em viewport ≥960px no post: TOC visível à esquerda, sticky no scroll
- [ ] Seção ativa da TOC fica em verde + borda esquerda enquanto o leitor rola
- [ ] Em viewport <960px no post: TOC vira collapse `<details>` no topo
- [ ] Barra verde fina no topo cresce no scroll do post
- [ ] Hover num `h2` mostra `#` à esquerda; clicar atualiza a URL com âncora
- [ ] Blocos de código mudam de tema com o toggle
- [ ] About (`/about`) renderiza sem TOC, sem barra de progresso
- [ ] RSS (`/rss.xml`) abre e está válido
- [ ] Footer minimal: `© 2026 Erico Lira · github · rss`

- [ ] **Step 5: Lighthouse acessibilidade**

Abrir DevTools → Lighthouse → Accessibility na home e num post.
Expected: score >= 95 em ambas as páginas. Anotar e corrigir se algo crítico aparecer.

- [ ] **Step 6: Commit final (se algum ajuste tiver sido feito)**

```bash
git status
# se algo mudou:
git add -A
git commit -m "fix: ajustes finais do redesign"
```

- [ ] **Step 7: Push opcional**

```bash
# Confirmar com o autor antes:
git push origin main
```
