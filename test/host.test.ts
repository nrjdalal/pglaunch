import {
  connectHost,
  DEFAULT_HOST,
  isLoopback,
  parseContainers,
  postgresUrl,
  publishSpec,
  validateHost,
} from "@/host"
import { describe, expect, test } from "bun:test"

describe("validateHost", () => {
  test("defaults to loopback", () => {
    expect(DEFAULT_HOST).toBe("127.0.0.1")
  })

  test("accepts IPv4 and IPv6 addresses", () => {
    expect(validateHost("127.0.0.1")).toBe("127.0.0.1")
    expect(validateHost("0.0.0.0")).toBe("0.0.0.0")
    expect(validateHost("::1")).toBe("::1")
    expect(validateHost("[::1]")).toBe("::1")
  })

  test("compresses IPv6 addresses", () => {
    expect(validateHost("::0")).toBe("::")
    expect(validateHost("0:0:0:0:0:0:0:0")).toBe("::")
    expect(validateHost("0:0:0:0:0:0:0:1")).toBe("::1")
  })

  test("rejects anything that is not an IP address", () => {
    for (const host of ["localhost", "", "example.com", "127.0.0.256"]) {
      expect(() => validateHost(host)).toThrow(`Invalid --host "${host}"`)
    }
  })
})

describe("isLoopback", () => {
  test("is true only for loopback addresses", () => {
    expect(isLoopback("127.0.0.1")).toBe(true)
    expect(isLoopback("127.0.1.1")).toBe(true)
    expect(isLoopback("::1")).toBe(true)
    expect(isLoopback("0.0.0.0")).toBe(false)
    expect(isLoopback("::")).toBe(false)
    expect(isLoopback("192.168.1.20")).toBe(false)
  })
})

describe("publishSpec", () => {
  test("binds the host port to the given address", () => {
    expect(publishSpec("127.0.0.1", "5432")).toBe("127.0.0.1:5432:5432")
    expect(publishSpec("0.0.0.0", "6543")).toBe("0.0.0.0:6543:5432")
  })

  test("brackets IPv6 addresses", () => {
    expect(publishSpec("::1", "5432")).toBe("[::1]:5432:5432")
  })
})

describe("connectHost", () => {
  test("maps wildcard addresses to this machine's loopback", () => {
    expect(connectHost("0.0.0.0")).toBe("127.0.0.1")
    expect(connectHost("::")).toBe("[::1]")
  })

  test("keeps a specific address, bracketing IPv6", () => {
    expect(connectHost("127.0.0.1")).toBe("127.0.0.1")
    expect(connectHost("192.168.1.20")).toBe("192.168.1.20")
    expect(connectHost("::1")).toBe("[::1]")
  })
})

describe("postgresUrl", () => {
  test("connects to the published address", () => {
    expect(postgresUrl("127.0.0.1", "5432")).toBe(
      "postgres://postgres:postgres@127.0.0.1:5432/postgres",
    )
    expect(postgresUrl("0.0.0.0", "5432")).toBe(
      "postgres://postgres:postgres@127.0.0.1:5432/postgres",
    )
    expect(postgresUrl("::1", "5432")).toBe(
      "postgres://postgres:postgres@[::1]:5432/postgres",
    )
  })
})

describe("parseContainers", () => {
  test("reads the name, host and port of each container", () => {
    const stdout = [
      "app-oAsK:127.0.0.1:4611->5432/tcp",
      "my-app-x1Y2:0.0.0.0:4612->5432/tcp, [::]:4612->5432/tcp",
      "v6-AbCd:[::1]:4613->5432/tcp",
      "unpublished-ZzZz:5432/tcp",
      "",
    ].join("\n")

    expect(parseContainers(stdout)).toEqual([
      { name: "app-oAsK", host: "127.0.0.1", port: "4611" },
      { name: "my-app-x1Y2", host: "0.0.0.0", port: "4612" },
      { name: "v6-AbCd", host: "::1", port: "4613" },
      { name: "unpublished-ZzZz", host: undefined, port: undefined },
    ])
  })

  test("reads the unbracketed IPv6 Docker printed before 23.0", () => {
    const stdout = [
      "any-AAAA::::4611->5432/tcp",
      "local-BBBB:::1:4613->5432/tcp",
      "both-CCCC:0.0.0.0:4614->5432/tcp, :::4614->5432/tcp",
    ].join("\n")

    expect(parseContainers(stdout)).toEqual([
      { name: "any-AAAA", host: "::", port: "4611" },
      { name: "local-BBBB", host: "::1", port: "4613" },
      { name: "both-CCCC", host: "0.0.0.0", port: "4614" },
    ])
  })
})
