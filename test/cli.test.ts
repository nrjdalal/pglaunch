import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { cli, node, root } from "./build"

// A stand-in for the docker CLI: logs every call, answers `ps` with $FAKE_DOCKER_PS
const fakeDocker = `#!/bin/sh
printf '%s\\n' "$*" >> "$FAKE_DOCKER_LOG"
if [ "$1" = "ps" ]; then printf '%s' "$FAKE_DOCKER_PS"; fi
`

let dir: string
let log: string

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "pglaunch-fake-docker-"))
  log = path.join(dir, "calls.log")
  writeFileSync(log, "")
  writeFileSync(path.join(dir, "docker"), fakeDocker)
  chmodSync(path.join(dir, "docker"), 0o755)
})

afterEach(() => rmSync(dir, { recursive: true, force: true }))

const run = (args: string[], ps = "") => {
  const proc = Bun.spawnSync([node!, cli, ...args], {
    cwd: root,
    env: {
      ...process.env,
      FAKE_DOCKER_LOG: log,
      FAKE_DOCKER_PS: ps,
      PATH: `${dir}${path.delimiter}${process.env.PATH}`,
    },
    timeout: 30_000,
  })
  const calls = readFileSync(log, "utf8").split("\n").filter(Boolean)
  return {
    exitCode: proc.exitCode,
    stdout: Bun.stripANSI(proc.stdout.toString()),
    stderr: Bun.stripANSI(proc.stderr.toString()),
    calls,
    run: calls.find((call) => call.startsWith("run ")),
  }
}

describe("pglaunch", () => {
  test("--help documents --host and its loopback default", () => {
    const result = run(["--help"])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("--host <addr>")
    expect(result.stdout).toContain("(default: 127.0.0.1, this machine only;")
  })

  test("publishes on 127.0.0.1 by default", () => {
    const result = run(["-n", "app", "-p", "54329"])

    expect(result.exitCode).toBe(0)
    expect(result.run).toContain(" -p 127.0.0.1:54329:5432 ")
    expect(result.stdout).toContain(
      "POSTGRES_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres",
    )
    expect(result.stdout).not.toContain("Warning:")
  })

  test("publishes a random port on 127.0.0.1 when no port is given", () => {
    const result = run(["-n", "app"])

    expect(result.exitCode).toBe(0)
    expect(result.run).toMatch(/ -p 127\.0\.0\.1:\d+:5432 /)
  })

  test("--host 0.0.0.0 publishes on every interface and warns", () => {
    const result = run(["-n", "app", "-p", "54329", "--host", "0.0.0.0"])

    expect(result.exitCode).toBe(0)
    expect(result.run).toContain(" -p 0.0.0.0:54329:5432 ")
    expect(result.stdout).toContain(
      "POSTGRES_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres",
    )
    expect(result.stdout).toContain("Warning: published on 0.0.0.0")
  })

  test("--host with a LAN address publishes there and warns", () => {
    const result = run(["-n", "app", "-p", "54329", "--host", "192.168.1.20"])

    expect(result.exitCode).toBe(0)
    expect(result.run).toContain(" -p 192.168.1.20:54329:5432 ")
    expect(result.stdout).toContain(
      "POSTGRES_URL=postgres://postgres:postgres@192.168.1.20:54329/postgres",
    )
    expect(result.stdout).toContain("Warning: published on 192.168.1.20")
  })

  test("--host takes an IPv6 address", () => {
    const result = run(["-n", "app", "-p", "54329", "--host", "::1"])

    expect(result.exitCode).toBe(0)
    expect(result.run).toContain(" -p [::1]:54329:5432 ")
    expect(result.stdout).toContain(
      "POSTGRES_URL=postgres://postgres:postgres@[::1]:54329/postgres",
    )
    expect(result.stdout).not.toContain("Warning:")
  })

  test("--host treats every spelling of the IPv6 wildcard alike", () => {
    const result = run([
      "-n",
      "app",
      "-p",
      "54329",
      "--host",
      "0:0:0:0:0:0:0:0",
    ])

    expect(result.exitCode).toBe(0)
    expect(result.run).toContain(" -p [::]:54329:5432 ")
    expect(result.stdout).toContain(
      "POSTGRES_URL=postgres://postgres:postgres@[::1]:54329/postgres",
    )
    expect(result.stdout).toContain("Warning: published on ::")
  })

  test("--host refuses a hostname before calling Docker", () => {
    const result = run(["-n", "app", "--host", "localhost"])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Invalid --host "localhost"')
    expect(result.calls).toEqual([])
  })

  test("a running container's URL uses the address it is published on", () => {
    const result = run(["-n", "app"], "app-oAsK:192.168.1.20:4611->5432/tcp")

    expect(result.exitCode).toBe(1)
    expect(result.stdout).toContain(
      "POSTGRES_URL=postgres://postgres:postgres@192.168.1.20:4611/postgres",
    )
    expect(result.run).toBeUndefined()
  })
})
