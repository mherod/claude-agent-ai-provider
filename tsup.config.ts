import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  minify: true,
  target: 'es2022',
  outDir: 'dist',
  clean: true,
  splitting: false,
  treeshake: true,
  tsconfig: 'tsconfig.build.json',
  external: [
    '@anthropic-ai/claude-agent-sdk',
    '@ai-sdk/provider',
    'zod',
  ],
});

