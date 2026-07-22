import { defineConfig } from 'vite';
import { resolve } from 'path';

// Multi-page static site — every top-level HTML file is an entry so
// `vite build` emits them all; the dev server picks them up automatically.
// The production backend serves clean URLs (/pricing → pricing.html);
// mirror that in dev so nav links work the same way.
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = req.url.split('?')[0];
      if (/^\/(pricing|contact|careers|login|dashboard|blog|privacy|cookies|terms)\/?$/.test(path)) {
        req.url = path.replace(/\/$/, '') + '.html';
      }
      next();
    });
  },
};

export default defineConfig({
  appType: 'mpa',
  plugins: [cleanUrls],
  server: {
    // forms post to /api/leads and /api/talent — forward to the FastAPI backend
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        contact: resolve(__dirname, 'contact.html'),
        careers: resolve(__dirname, 'careers.html'),
        blog: resolve(__dirname, 'blog.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        terms: resolve(__dirname, 'terms.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
});
