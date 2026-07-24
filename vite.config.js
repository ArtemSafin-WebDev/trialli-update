import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const projectRoot = import.meta.dirname;

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

  for (const item of readdirSync(directory, { withFileTypes: true })) {
    if (item.name === 'dist' || item.name === 'node_modules' || item.name.startsWith('.')) {
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

export default defineConfig({
  plugins: [trialliCartStub()],
  build: {
    rollupOptions: {
      input: collectHtmlEntries(),
    },
  },
});
