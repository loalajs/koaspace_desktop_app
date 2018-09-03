const bunyan = require("bunyan");
const path = require("path");

const log = bunyan.createLogger({
  name: "koaspace_desktop",
  streams: [
    {
      level: "info",
      stream: process.stdout
    },
    {
      level: "error",
      path: path.resolve(process.cwd(), "logs", "error.log"),
      type: "file"
    },
    {
      level: "debug",
      stream: process.stdout
    }
  ]
});

module.exports = {
  log
};
