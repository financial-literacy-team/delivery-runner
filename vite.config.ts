import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import {resolve} from 'node:path'

export default defineConfig(({mode}) => {
    const isLib = mode === 'production'

    return {
        plugins: [
            vue(),
            isLib
                ? dts({
                    tsconfigPath: './tsconfig.json',
                    rollupTypes: true,
                })
                : undefined,
        ],
        build: isLib
            ? {
                lib: {
                    entry: resolve(import.meta.dirname, 'src/index.ts'),
                    name: 'DeliveryRunner',
                    fileName: (format) => `delivery-runner.${format === 'es' ? 'js' : 'umd.cjs'}`,
                },
                rollupOptions: {
                    external: ['vue'],
                    output: {
                        globals: {
                            vue: 'Vue',
                        },
                        exports: 'named',
                    },
                },
                cssCodeSplit: false,
            }
            : {},
    }
})