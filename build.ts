import { $ } from 'bun'
import { build, type Options } from 'tsup'

await $`rm -rf dist`

const tsupOptions: Options = {
  entry: ['src/**/*.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  bundle: true,
} satisfies Options

await Promise.all([
  build({
    outDir: 'dist',
    format: 'esm',
    target: 'node20',
    cjsInterop: true,
    ...tsupOptions,
  }),
  build({
    outDir: 'dist/cjs',
    format: 'cjs',
    target: 'node20',
    ...tsupOptions,
  }),
])

await $`tsc --project tsconfig.dts.json`

await Promise.all([$`cp dist/*.d.ts dist/cjs`])

process.exit(0)
