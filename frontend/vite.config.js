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
      // /blog/<slug> is a real page served from blog-<slug>.html — check it
      // first, otherwise the top-level rule below would swallow /blog/.
      const post = /^\/blog\/([a-z0-9-]+)\/?$/.exec(path);
      if (post) {
        req.url = `/blog-${post[1]}.html`;
      } else if (
        /^\/(pricing|contact|careers|login|dashboard|blog|privacy|cookies|terms|services|industries|ai-cold-calling-rules-india)\/?$/.test(path)
      ) {
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
        services: resolve(__dirname, 'services.html'),
        industries: resolve(__dirname, 'industries.html'),
        aiColdCallingRules: resolve(__dirname, 'ai-cold-calling-rules-india.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogVoiceAi: resolve(__dirname, 'blog-voice-ai-in-production-2026.html'),
        blogWhatsapp: resolve(__dirname, 'blog-whatsapp-automation-playbook.html'),
        blogAgents: resolve(__dirname, 'blog-from-chatbots-to-agents.html'),
        blogWorkflows: resolve(__dirname, 'blog-five-workflows-to-automate.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        terms: resolve(__dirname, 'terms.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
});
