import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    allowedHosts: [
      'complement-relevance-wage-petroleum.trycloudflare.com',
      '.trycloudflare.com',
      'localhost',
      '127.0.0.1',
      '.loca.lt',
      'all'
    ],
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'complement-relevance-wage-petroleum.trycloudflare.com',
      '.trycloudflare.com',
      'localhost',
      '127.0.0.1',
      '.loca.lt',
      'all'
    ],
    cors: true
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 2000
  },
  // Large binary assets (FBX / HDR) live in /public and are served untouched.
  assetsInclude: ['**/*.fbx', '**/*.hdr']
});
