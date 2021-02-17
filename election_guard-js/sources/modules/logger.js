class ConsoleLogger {
  constructor() {
  }

  debug(message) {
    this.log("debug", message)
  }

  warning(message) {
    this.log("warning", message)
  }

  info(message) {
    this.log("info", message)
  }

  error(message) {
    this.log("error", message)
  }

  critical(message) {
    this.log("critical", message)
  }

  log(type, message) {
    console.log(type + ": " + message)
  }
}

export var Logger = function() { return new ConsoleLogger(); }