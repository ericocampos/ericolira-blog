// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeMermaid from 'rehype-mermaid';

import cloudflare from '@astrojs/cloudflare';

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
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: 'inline-svg',
        mermaidConfig: {
          theme: 'base',
          themeVariables: {
            fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
            fontSize: '14px',
            primaryColor: '#f0f0ec',
            primaryTextColor: '#1a1a1a',
            primaryBorderColor: '#888888',
            lineColor: '#888888',
            secondaryColor: '#fafafa',
            tertiaryColor: '#fafafa',
          },
        },
      }],
    ],
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
