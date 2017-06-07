const path = require("path")
const util = require("util")
const glob = util.promisify(require("glob"))
const readFile = util.promisify(require("jsonfile").readFile)
const { MeshbluConnectorDaemon } = require("meshblu-connector-daemon")

class MeshbluConnectorConfigurator {
  constructor({ connectorHome }) {
    this.connectorHome = connectorHome
    this.connectorsPath = path.resolve(path.join(connectorHome, "connectors"))
    this.configurationsPath = path.resolve(path.join(connectorHome, "config", "meshblu-json"))
  }

  configurate() {
    const globPath = path.join(this.configurationsPath, "meshblu-connector-*", "*.json")
    return glob(globPath).then(files => {
      let processes = []
      files.forEach(file => {
        processes.push(this.daemonize(file))
      })
      return Promise.all(processes)
    })
  }

  daemonize(file) {
    return readFile(file).then(data => {
      const type = path.basename(path.dirname(file))
      const { uuid, token, domain } = data
      const connectorsPath = this.connectorsPath
      const daemon = new MeshbluConnectorDaemon({ uuid, type, token, domain, connectorsPath })
      return daemon.start()
    })
  }
}

module.exports.MeshbluConnectorConfigurator = MeshbluConnectorConfigurator
