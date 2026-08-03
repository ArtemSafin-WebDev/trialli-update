import { cpSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { htmlPartials } from './scripts/vite-html-partials.mjs';

const projectRoot = import.meta.dirname;
const partialsRoot = resolve(projectRoot, 'src/partials');

function trialliCartStub() {
  const middleware = (request, response, next) => {
    if (request.url?.split('?')[0] !== '/ajax/getCart.php') {
      next();
      return;
    }

    response.statusCode = 200;
    // Исходный cart.js сам вызывает JSON.parse, поэтому ответ должен остаться текстом.
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(JSON.stringify({ cnt: 0, cart: null }));
  };

  return {
    name: 'trialli-local-cart-stub',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

function collectHtmlEntries(directory = projectRoot) {
  const entries = {};
  const ignoredRootDirectories = new Set([
    'dist',
    'node_modules',
    'output',
    'public',
    'scripts',
    'src',
    'work',
  ]);

  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (
      item.name.startsWith('.') ||
      (directory === projectRoot && ignoredRootDirectories.has(item.name))
    ) {
      continue;
    }

    const absolutePath = resolve(directory, item.name);

    if (item.isDirectory()) {
      Object.assign(entries, collectHtmlEntries(absolutePath));
      continue;
    }

    if (item.isFile() && item.name.endsWith('.html')) {
      const relativeName = absolutePath
        .slice(projectRoot.length + 1)
        .replace(/\.html$/, '')
        .replaceAll('/', '-');

      entries[relativeName || 'index'] = absolutePath;
    }
  }

  return entries;
}

function copyProjectAssets() {
  return {
    name: 'trialli-copy-project-assets',
    closeBundle() {
      cpSync(
        resolve(projectRoot, 'public/assets'),
        resolve(projectRoot, 'dist/assets'),
        { recursive: true },
      );
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [
    htmlPartials({ root: projectRoot, partialsDir: partialsRoot }),
    trialliCartStub(),
    copyProjectAssets(),
  ],
  build: {
    // public/vendor — это внешние файлы существующего сайта. В dist их не копируем.
    copyPublicDir: false,
    manifest: true,
    modulePreload: false,
    rollupOptions: {
      input: collectHtmlEntries(),
      output: {
        manualChunks(id) {
          if (
            id.includes('/src/scripts/site.js') ||
            id.includes('/src/scripts/catalog-menu.js') ||
            id.includes('/src/scripts/components/') ||
            id.includes('/src/scripts/trialli-home-picker')
          ) {
            return 'site-components';
          }
        },
      },
    },
  },
});
