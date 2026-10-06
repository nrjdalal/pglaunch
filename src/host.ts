import { isIP } from "node:net"

export const DEFAULT_HOST = "127.0.0.1"

const unbracket = (host: string) => host.replace(/^\[(.*)\]$/, "$1")

const bracket = (host: string) => (isIP(host) === 6 ? `[${host}]` : host)

// Compresses an IPv6 address, e.g. 0:0:0:0:0:0:0:0 and ::0 both become ::
const normalize = (address: string) => {
  if (isIP(address) !== 6) return address
  try {
    return unbracket(new URL(`http://[${address}]`).hostname)
  } catch {
    return address
  }
}

export const validateHost = (host: string) => {
  const address = unbracket(host)
  if (!isIP(address)) {
    throw new Error(
      `Invalid --host "${host}": use an IP address, e.g. 127.0.0.1 (this machine only) or 0.0.0.0 (all interfaces).`,
    )
  }
  return normalize(address)
}

export const isLoopback = (host: string) =>
  isIP(host) === 4 ? host.startsWith("127.") : host === "::1"

// Docker's -p value, e.g. 127.0.0.1:5432:5432 or [::1]:5432:5432
export const publishSpec = (host: string, port: string) =>
  `${bracket(host)}:${port}:5432`

// The address a client on this machine connects to for a published host
export const connectHost = (host: string) => {
  if (host === "0.0.0.0") return "127.0.0.1"
  if (host === "::") return "[::1]"
  return bracket(host)
}

export const postgresUrl = (host: string, port: string) =>
  `postgres://postgres:postgres@${connectHost(host)}:${port}/postgres`

// Parses `docker ps --format {{.Names}}:{{.Ports}}` lines, e.g. pglaunch-oAsK:127.0.0.1:4611->5432/tcp, where Docker before 23.0 printed IPv6 unbracketed (:::4611->5432/tcp)
export const parseContainers = (stdout: string) =>
  stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const firstColon = line.indexOf(":")
      const name = line.slice(0, firstColon)
      const binding = line
        .slice(firstColon + 1)
        .split(", ")
        .map((entry) => entry.match(/^(.*):(\d+)->5432\/tcp$/))
        .find(Boolean)
      return {
        name,
        host: binding ? normalize(unbracket(binding[1])) : undefined,
        port: binding ? binding[2] : undefined,
      }
    })
