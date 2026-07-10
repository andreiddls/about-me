import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runPrerender() {
  execSync('node scripts/prerender.js', {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

function prerenderPlugin() {
  return {
    name: 'prerender-html',
    buildStart() {
      runPrerender();
    },
    configureServer(server) {
      runPrerender();
      server.watcher.add(path.join(__dirname, 'data/cv-data.json'));
      server.watcher.add(path.join(__dirname, 'index.template.html'));
      server.watcher.add(path.join(__dirname, 'scripts/prerender.js'));
      server.watcher.on('change', (file) => {
        if (
          file.endsWith('cv-data.json') ||
          file.endsWith('index.template.html') ||
          file.endsWith('prerender.js')
        ) {
          runPrerender();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [prerenderPlugin(), react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        sc_platform: 'sc_platform.html',
      },
    },
  },
});