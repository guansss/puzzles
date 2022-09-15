import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import nested from 'postcss-nested';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            vue: 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
        },
    },
    css: {
        postcss: {
            plugins: [autoprefixer(), nested()],
        },
        modules: {
            localsConvention: 'camelCaseOnly',
            generateScopedName: '[local]',
        },
    },
    build: {
        minify: false,
        polyfillModulePreload: false,
        rollupOptions: {
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name][extname]',
            },
        },
    },
});
