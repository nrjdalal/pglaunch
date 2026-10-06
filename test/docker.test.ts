import { afterAll, describe, expect, test } from "bun:test"
import { cli, node, root } from "./build"

const docker = (args: string[]) => {
  try {
    return Bun.spawnSync(["docker", ...args], { timeout: 30_000 })
  } catch {
    return undefined
  }
}

const dockerRunning = docker(["info"])?.exitCode === 0

// pglaunch appends a random suffix, so cleanup finds the container by this prefix
const base = `pglaunch-test-${Date.now()}`

afterAll(() => {
  const ps = docker([
    "ps",
    "--all",
    "--filter",
    `name=^${base}-`,
    "--format",
    "{{.Names}}",
  ])
  const names = ps?.stdout.toString().split("\n").filter(Boolean) ?? []
  for (const name of names) docker(["rm", "--force", name])
}, 60_000)

const query = async (url: string) => {
  const deadline = Date.now() + 60_000
  while (true) {
    const sql = new Bun.SQL(url)
    try {
      return await sql`select 1 as ok`
    } catch (err) {
      if (Date.now() > deadline) throw err
      await Bun.sleep(500)
    } finally {
      await sql.close()
    }
  }
}

describe.skipIf(!dockerRunning)("pglaunch with Docker", () => {
  test(
    "publishes the container on 127.0.0.1 only, at the printed URL",
    async () => {
      const proc = Bun.spawnSync([node!, cli, "-n", base], {
        cwd: root,
        timeout: 150_000,
      })
      const stdout = Bun.stripANSI(proc.stdout.toString())

      expect(proc.exitCode).toBe(0)
      const [, name, port] =
        stdout.match(/A container with name "(\S+) :(\d+)"/) ?? []
      expect(name).toStartWith(`${base}-`)

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

      const url = stdout.match(/POSTGRES_URL=(\S+)/)?.[1]
      expect(url).toBe(
        `postgres://postgres:postgres@127.0.0.1:${port}/postgres`,
      )
      const [row] = await query(url!)
      expect(row).toEqual({ ok: 1 })
    },
    { timeout: 300_000 },
  )
})
