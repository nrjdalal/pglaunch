#!/usr/bin/env node
import path from "node:path"
import { parseArgs } from "node:util"
import {
  DEFAULT_HOST,
  parseContainers,
  postgresUrl,
  publishSpec,
  validateHost,
} from "@/host"
import { author, name, version } from "~/package.json"
import getPort from "get-port"
import spawn from "nano-spawn"
import { customAlphabet } from "nanoid"
import terminalLink from "terminal-link"
import { bold, green, red } from "yoctocolors"

const helpMessage = `
With ${bold(`${terminalLink("PGLaunch", "https://github.com/nrjdalal/pglaunch")}`)} instantly launch disposable PostgreSQL containers!

Usage:
  $ ${name} [options]

Options:
  -n, --name <name>  Name for PostgresSQL database
                     (default: current directory name)
  -p, --port <port>  Port for PostgresSQL database
                     (default: random available port)
      --host <addr>  Host address to publish the port on
                     (default: ${DEFAULT_HOST}, this machine only;
                     use 0.0.0.0 to expose it to your network)
  -k, --keep         Keep the container after exit
                     (default: false)
  -c, --confirm      Confirm starting another container with the same name
  -v, --version      Display version
  -h, --help         Display help

Author:
  ${author.name} <${author.email}> (${author.url})`

const parse: typeof parseArgs = (config) => {
  try {
    return parseArgs(config)
  } catch (err: any) {
    throw new Error(`Error parsing arguments: ${err.message}`)
  }
}

const main = async () => {
  try {
    const { positionals, values } = parse({
      allowPositionals: true,
      options: {
        name: { type: "string", short: "n" },
        port: { type: "string", short: "p" },
        host: { type: "string" },
        keep: { type: "boolean", short: "k", default: false },
        confirm: { type: "boolean", short: "c", default: false },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    })

    if (!positionals.length) {
      if (values.version) {
        console.log(`${name}@${version}`)
        process.exit(0)
      }
      if (values.help) {
        console.log(helpMessage)
        process.exit(0)
      }
    }

    console.log(
      `\n  With ${bold(`${terminalLink("PGLaunch", "https://github.com/nrjdalal/pglaunch")}`)} instantly launch disposable PostgreSQL containers!\n`,
    )

    // Check if Docker is installed
    try {
      await spawn("docker", ["--version"], { stdio: "ignore" })
    } catch {
      console.error(
        "- Docker is not installed. Please install Docker and try again.\n" +
          `  Download it here: ${green("https://docs.docker.com/desktop")}`,
      )
      process.exit(1)
    }

    // Check if Docker daemon is running
    try {
      await spawn("docker", ["info"], { stdio: "ignore" })
    } catch {
      console.error(
        `- Docker is installed but not running.\n  ${green("Please start the Docker application/daemon and try again.")}`,
      )
      process.exit(1)
    }

    // Create a configuration object
    const config: Record<string, string> = {
      name: values.name || path.basename(process.cwd()),
      port: values.port || String(await getPort()),
      host: validateHost(values.host ?? DEFAULT_HOST),
    }

    // List all running containers as { name, host, port }[] where image is postgres:alpine
    let { stdout: containers } = await spawn("docker", [
      "ps",
      "--filter",
      "ancestor=postgres:alpine",
      "--format",
      "{{.Names}}:{{.Ports}}",
    ])

    const containersList = parseContainers(containers)

    // Check if the container name already exists
    if (
      !values.confirm &&
      containersList.some(
        (c) => c.name.split("-").slice(0, -1).join("-") === config.name,
      )
    ) {
      for (const container of containersList) {
        if (container.name.split("-").slice(0, -1).join("-") !== config.name) {
          continue
        }
        console.info(
          `- A container by similar name "${container.name}" running at port ${container.port}.\n\n  ${red(`POSTGRES_URL=${postgresUrl(container.host ?? DEFAULT_HOST, String(container.port))}`)}\n`,
        )
      }
      console.error(
        "  Error:\n" +
          "  - Specify a different name with the `-n` flag, e.g. -n my-project.\n" +
          "  - Or use `-c` flag to start another container with a similar name.",
      )
      process.exit(1)
    }

    // Start a new container with config.name and config.port
    try {
      config.name = `${config.name}-${customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        4,
      )()}`
      const password = customAlphabet(
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        7,
      )()

      await spawn("docker", [
        "run",
        "-d",
        ...(!values.keep ? ["--rm"] : []),
        "--name",
        config.name,
        "-p",
        publishSpec(config.host, config.port),
        "-e",
        "POSTGRES_USER=postgres",
        "-e",
        `POSTGRES_PASSWORD=postgres`,
        "-e",
        "POSTGRES_DB=postgres",
        "postgres:alpine",
      ])

      console.log(
        `- A container with name "${config.name} :${config.port}" started successfully.\n\n` +
          `  ${green(`POSTGRES_URL=${postgresUrl(config.host, config.port)}`)}`,
      )

      if (config.host === "0.0.0.0" || config.host === "::") {
        console.log(
          `\n  ${red("Warning:")} published on ${config.host}, so any device on your network can reach this database with the default credentials.`,
        )
      }

      if (!values.keep) {
        console.log(
          "\n  If you want to --keep the container after exit, use the `-k` flag.",
        )
      }
    } catch (err: any) {
      throw new Error(`Failed to start the Postgres container: ${err.message}`)
    }

    process.exit(0)
  } catch (err: any) {
    console.error(helpMessage)
    console.error(`\n${err.message}\n`)
    process.exit(1)
  }
}

main()
