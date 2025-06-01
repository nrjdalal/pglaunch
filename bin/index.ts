#!/usr/bin/env node
import path from "node:path"
import { parseArgs } from "node:util"
import { author, name, version } from "~/package.json"
import getPort from "get-port"
import spawn from "nano-spawn"
import { customAlphabet } from "nanoid"
import { green, red } from "yoctocolors"

const helpMessage = `Version:
  ${name}@${version}

Usage:
  $ ${name} [options]

Options:
  -n, --name <name>  Name for PostgresSQL database
                     (default: current directory name)
  -p, --port <port>  Port for PostgresSQL database
                     (default: random available port)
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
    }

    // List all running containers with names and ports as {name: port}[] where image is postgres:alpine
    let { stdout: containers } = await spawn("docker", [
      "ps",
      "--filter",
      "ancestor=postgres:alpine",
      "--format",
      "{{.Names}}:{{.Ports}}",
    ])

    const containersList = containers
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        // Example container info: pglaunch-oAsK:0.0.0.0:4611->5432/tcp
        const firstColon = line.indexOf(":")
        const name = line.slice(0, firstColon)
        const portInfo = line.slice(firstColon + 1)
        const hostPortMatch = portInfo.match(/(\d+)->5432\/tcp/)
        const port = hostPortMatch ? hostPortMatch[1] : undefined
        return { name, port }
      })

    // Check if the container name already exists
    if (
      !values.confirm &&
      containersList.some(
        (c) => c.name.split("-").slice(0, -1).join("-") === config.name,
      )
    ) {
      for (const container of containersList) {
        console.info(
          `- Container by name ${container.name} is already running at ${container.port}.\n  ${green(`POSTGRES_URL=postgres://postgres:postgres@localhost:${container.port}/postgres`)}`,
        )
      }
      console.error(
        "\n  Options:\n" +
          "    1. Specify a different name with the -n flag (e.g. -n my-project).\n" +
          "    2. Use the -c flag to confirm starting another container with the same name.",
      )
      process.exit(1)
    }

    // Start a new container
    config.name = `${config.name}-${customAlphabet(
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
      4,
    )()}`

    try {
      await spawn("docker", [
        "run",
        "-d",
        ...(!values.keep ? ["--rm"] : []),
        "--name",
        config.name,
        "-p",
        `${config.port}:5432`,
        "-e",
        "POSTGRES_USER=postgres",
        "-e",
        "POSTGRES_PASSWORD=postgres",
        "-e",
        "POSTGRES_DB=postgres",
        "postgres:alpine",
      ])

      console.log(
        `- Container ${config.name} started successfully on port ${config.port}.\n` +
          `  ${green(`POSTGRES_URL=postgres://postgres:postgres@localhost:${config.port}/postgres`)}`,
      )
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
