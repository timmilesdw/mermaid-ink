const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const extensionConfig = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
};

const previewConfig = {
  entryPoints: ['./src/preview/mermaid-renderer.ts'],
  bundle: true,
  outfile: './dist/preview/mermaid-renderer.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
};

async function copyAssets() {
  const distPreviewDir = './dist/preview';
  if (!fs.existsSync(distPreviewDir)) {
    fs.mkdirSync(distPreviewDir, { recursive: true });
  }

  fs.copyFileSync(
    './src/preview/mermaid.css',
    './dist/preview/mermaid.css'
  );
  console.log('Copied mermaid.css to dist/preview/');
}

async function build() {
  try {
    if (isWatch) {
      const extCtx = await esbuild.context(extensionConfig);
      const previewCtx = await esbuild.context(previewConfig);

      await extCtx.watch();
      await previewCtx.watch();

      await copyAssets();
      console.log('Watching for changes...');
    } else {
      await esbuild.build(extensionConfig);
      console.log('Built extension.js');

      await esbuild.build(previewConfig);
      console.log('Built mermaid-renderer.js');

      await copyAssets();
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
