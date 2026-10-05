import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mockServer from 'vite-plugin-mock-server';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // tanstackRouter({
    //   target: 'react',
    //   autoCodeSplitting: true,
    // }),
    tailwindcss(),
    react(),
    mockServer({
      mockRootDir: './mock',
      logLevel: 'info',
      urlPrefixes: ['/builders', '/api'],
      middlewares: [
        cookieParser(),
        bodyParser.json({limit: '50mb'}),
        bodyParser.urlencoded(),
        bodyParser.text(),
        bodyParser.raw()
      ],
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'scripts',
          dest: '.'
        },
        {
          src: 'libs',
          dest: '.'
        },
      ]
    }),
  ],
  resolve: {
    alias: {
      'dayjs': path.resolve(__dirname, 'node_modules/dayjs'),
      '@': path.resolve(__dirname, 'src'),
      "~": path.resolve(__dirname, "src"),
      '@apps': path.resolve(__dirname, 'src/apps'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@configs': path.resolve(__dirname, 'src/configs'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utils': path.resolve(__dirname, 'src/shared/utils'),
      '@types': path.resolve(__dirname, 'src/shared/types'),
      '@components': path.resolve(__dirname, 'src/shared/components'),
      '@hooks': path.resolve(__dirname, 'src/shared/hooks'),
      '@services': path.resolve(__dirname, 'src/shared/services'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      "@packages": path.resolve(__dirname, "./packages"),
      "@antd/InputNumber": path.resolve(__dirname, "./packages/components/InputNumber/index.tsx")
    },
  },
  // server: {
  //   watch: {
  //     ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
  //   },
  // },


  // esbuild: {
  //   target: 'esnext',
  // },

  // optimizeDeps: {
  //   force: false,
  // },
  // build: {
  //   chunkSizeWarningLimit: 1000, // đơn vị KB, ví dụ 1000 KB = 1MB default 500kb
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           if (id.includes('react')) {
  //             return 'vendor_react';
  //           }
  //           return 'vendor';
  //         }
  //       }
  //     }
  //   }
  // }
})
