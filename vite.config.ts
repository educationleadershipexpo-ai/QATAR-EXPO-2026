import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { glob } from 'glob';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Get all HTML files in the root directory
    const htmlFiles = glob.sync('*.html', { cwd: __dirname });
    const input = htmlFiles.reduce((entries, file) => {
      const name = file.replace('.html', '');
      entries[name] = path.resolve(__dirname, file);
      return entries;
    }, {} as Record<string, string>);

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        rollupOptions: {
          input,
        },
      },
      plugins: [],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
