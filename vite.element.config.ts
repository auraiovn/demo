import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function injectCssIntoElementBundle(): Plugin {
  return {
    name: 'aura-inline-custom-element-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const cssFiles = Object.entries(bundle).filter(
        ([fileName, output]) => output.type === 'asset' && fileName.endsWith('.css'),
      );
      const css = cssFiles
        .map(([, output]) =>
          output.type === 'asset' && typeof output.source === 'string'
            ? output.source
            : '',
        )
        .join('\n');

      if (!css) {
        return;
      }

      for (const [fileName] of cssFiles) {
        delete bundle[fileName];
      }

      const script = Object.values(bundle).find(
        (output) => output.type === 'chunk' && output.isEntry,
      );
      if (script?.type !== 'chunk') {
        return;
      }

      const injection = `(() => {\n  const id = 'aura-vto-element-styles';\n  if (!document.getElementById(id)) {\n    const style = document.createElement('style');\n    style.id = id;\n    style.textContent = ${JSON.stringify(css)};\n    document.head.append(style);\n  }\n})();\n`;
      script.code = injection + script.code;
    },
  };
}

export default defineConfig({
  plugins: [react(), injectCssIntoElementBundle()],
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist-element',
    emptyOutDir: true,
    lib: {
      entry: 'src/wix/aura-vto-element.tsx',
      name: 'AuraVirtualTryOn',
      formats: ['iife'],
      fileName: () => 'aura-vto-element.js',
    },
  },
});
