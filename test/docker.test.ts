import path from "node:path"
import { afterAll, describe, expect, test } from "bun:test"

const root = path.join(import.meta.dir, "..")

const docker = (args: string[]) => {
  try {
    return Bun.spawnSync(["docker", ...args])
  } catch {
    return undefined
  }
}

const dockerRunning = docker(["info"])?.exitCode === 0
const started: string[] = []

afterAll(() => {
  for (const name of started) docker(["rm", "--force", name])
}, 30_000)

describe.skipIf(!dockerRunning)("pglaunch with Docker", () => {
  test(
    "publishes the container on 127.0.0.1 only",
    () => {
      const proc = Bun.spawnSync([
        process.execPath,
        path.join(root, "bin/index.ts"),
        "-n",
        "pglaunch-test",
        "-c",
      ])
      const stdout = Bun.stripANSI(proc.stdout.toString())
      const match = stdout.match(/A container with name "(\S+) :(\d+)"/)
      if (match) started.push(match[1])

      expect(proc.exitCode).toBe(0)
      expect(match).not.toBeNull()
      const [, name, port] = match!

      const bindings = JSON.parse(
        docker([
          "inspect",
          "--format",
          "{{json .HostConfig.PortBindings}}",
          name,
        ])!.stdout.toString(),
      )
      expect(bindings).toEqual({
        "5432/tcp": [{ HostIp: "127.0.0.1", HostPort: port }],
      })
      expect(stdout).toContain(
        `POSTGRES_URL=postgres://postgres:postgres@127.0.0.1:${port}/postgres`,
      )
    },
    { timeout: 180_000 },
  )
})
