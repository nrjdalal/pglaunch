import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    "bin/index": "bin/index.ts",
  },
  format: ["esm"],
  minify: true,
  outDir: "dist",
})
