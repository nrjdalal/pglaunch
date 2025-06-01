#!/usr/bin/env node
import { parseArgs } from "node:util"
import { test } from "~/bin/commands/test"
import { author, name, version } from "~/package.json"

const helpMessage = `Version:
  ${name}@${version}

Usage:
  $ ${name} <command> [options]

Commands:
  test           Test command

Options:
  -v, --version  Display version
  -h, --help     Display help for <command>

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
    const args = process.argv.slice(2)

    switch (args[0]) {
      case "test":
        test(args.slice(1))
        break
    }

    const { positionals, values } = parse({
      allowPositionals: true,
      options: {
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    })

    if (!args.length) throw new Error(helpMessage)

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

    console.error(`unknown command: ${args.join(" ")}`)
    process.exit(0)
  } catch (err: any) {
    console.error(helpMessage)
    console.error(`\n${err.message}\n`)
    process.exit(1)
  }
}

main()
