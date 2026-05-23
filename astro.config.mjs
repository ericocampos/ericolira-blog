// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { visit } from 'unist-util-visit';

import cloudflare from '@astrojs/cloudflare';

// Renomeia <pre><code class="language-mermaid">…</code></pre> para <pre class="mermaid">…</pre>
// pra que mermaid.js encontre os blocos no cliente. Substitui rehype-mermaid
// no modo pre-mermaid sem arrastar a dep transitiva de playwright.
function rehypeMermaidPre() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        parent &&
        typeof index === 'number' &&
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].type === 'element' &&
        node.children[0].tagName === 'code' &&
        Array.isArray(node.children[0].properties?.className) &&
        node.children[0].properties.className.includes('language-mermaid')
      ) {
        const source = node.children[0].children
          .filter((c) => c.type === 'text')
          .map((c) => c.value)
          .join('');
        parent.children[index] = {
          type: 'element',
          tagName: 'pre',
          properties: { className: ['mermaid'] },
          children: [{ type: 'text', value: source }],
        };
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://ericolira.dev',
  integrations: [mdx(), sitemap()],

  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
    },
    rehypePlugins: [rehypeMermaidPre],
  },

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

  adapter: cloudflare(),
});
