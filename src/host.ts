import { isIP } from "node:net"

export const DEFAULT_HOST = "127.0.0.1"

const bracket = (host: string) => (isIP(host) === 6 ? `[${host}]` : host)

export const validateHost = (host: string) => {
  const address = host.replace(/^\[(.*)\]$/, "$1")
  if (!isIP(address)) {
    throw new Error(
      `Invalid --host "${host}": use an IP address, e.g. 127.0.0.1 (this machine only) or 0.0.0.0 (all interfaces).`,
    )
  }
  return address
}

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

// Parses `docker ps --format {{.Names}}:{{.Ports}}` lines, e.g. pglaunch-oAsK:127.0.0.1:4611->5432/tcp
export const parseContainers = (stdout: string) =>
  stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const firstColon = line.indexOf(":")
      const name = line.slice(0, firstColon)
      const portInfo = line.slice(firstColon + 1)
      const match = portInfo.match(/(\[[^\]]*\]|[\d.]+):(\d+)->5432\/tcp/)
      return {
        name,
        host: match ? match[1].replace(/^\[(.*)\]$/, "$1") : undefined,
        port: match ? match[2] : undefined,
      }
    })
