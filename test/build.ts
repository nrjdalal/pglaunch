import path from "node:path"

export const root = path.join(import.meta.dir, "..")

// The published CLI, built once per test run and run under Node, as npx runs it
export const cli = path.join(root, "dist/bin/index.js")

export const node = Bun.which("node")
if (!node) throw new Error("The tests run the CLI under Node: install node.")

const build = Bun.spawnSync([process.execPath, "run", "build"], {
  cwd: root,
  timeout: 120_000,
})
if (build.exitCode !== 0) {
  throw new Error(`bun run build failed:\n${build.stderr.toString()}`)
}
