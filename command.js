#!/usr/bin/env node
const dashdash = require("dashdash")
const path = require("path")
const util = require("util")
const fs = require("fs")
const chalk = require("chalk")
const { MeshbluConnectorConfigurator } = require("./src/configurator")

const CLI_OPTIONS = [
  {
    name: "version",
    type: "bool",
    help: "Print connector version and exit.",
  },
  {
    names: ["help", "h"],
    type: "bool",
    help: "Print this help and exit.",
  },
  {
    names: ["connectors-path"],
    type: "string",
    env: "MESHBLU_CONNECTOR_CONNECTORS_PATH",
    help: "Base location of meshblu connectors",
    helpArg: "PATH",
  },
  {
    names: ["configurations-path"],
    type: "string",
    env: "MESHBLU_CONNECTOR_CONFIGURATIONS_PATH",
    help: "Base location of meshblu ",
    helpArg: "PATH",
  },
]

class MeshbluConnectorConfiguratorCommand {
  constructor(options) {
    if (!options) options = {}
    var { argv, cliOptions } = options
    if (!cliOptions) cliOptions = CLI_OPTIONS
    if (!argv) return this.die(new Error("MeshbluConnectorConfiguratorCommand requires options.argv"))
    this.argv = argv
    this.cliOptions = cliOptions
    this.parser = dashdash.createParser({ options: this.cliOptions })
  }

  parseArgv({ argv }) {
    try {
      var opts = this.parser.parse(argv)
    } catch (e) {
      return {}
    }

    if (opts.help) {
      console.log(`usage: meshblu-connector-configurator-meshblu-json [OPTIONS]\noptions:\n${this.parser.help({ includeEnv: true })}`)
      process.exit(0)
    }

    if (opts.version) {
      console.log(this.packageJSON.version)
      process.exit(0)
    }

    return opts
  }

  async run() {
    const options = this.parseArgv({ argv: this.argv })
    const { connectors_path, configurations_path } = options
    var errors = []
    if (!connectors_path) errors.push(new Error("MeshbluConnectorCommand requires --connectors-path or MESHBLU_CONNECTOR_CONNECTORS_PATH"))
    if (!configurations_path) errors.push(new Error("MeshbluConnectorCommand requires --configurations-path or MESHBLU_CONNECTOR_CONFIGURATIONS_PATH"))

    if (errors.length) {
      console.log(`usage: meshblu-connector-pkg [OPTIONS]\noptions:\n${this.parser.help({ includeEnv: true })}`)
      errors.forEach(error => {
        console.error(chalk.red(error.message))
      })
      process.exit(1)
    }

    const configurator = new MeshbluConnectorConfigurator({ configurationsPath: configurations_path, connectorsPath: connectors_path })
    try {
      await configurator.configurate()
    } catch (error) {
      this.die(error)
    }
    // process.exit(0)
  }

  die(error) {
    console.error(chalk.red("Meshblu Connector Installer Command: error: %s", error.message))
    process.exit(1)
  }
}

const command = new MeshbluConnectorConfiguratorCommand({ argv: process.argv })
command.run().catch(error => {
  console.error(error)
})
