import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Dynamically discover all HTML files in the project root for Vite multi-page build
const input = {};
const files = fs.readdirSync(__dirname);

files.forEach(file => {
  if (file.endsWith('.html') && file !== 'index.html') {
    const name = file.replace('.html', '');
    input[name] = resolve(__dirname, file);
  }
});

// Always include the main index.html
input['main'] = resolve(__dirname, 'index.html');

export default defineConfig({
  build: {
    rollupOptions: {
      input
    }
  }
});
