const bunyan = require("bunyan");
const path = require("path");

const log = bunyan.createLogger({
  name: "koaspace_desktop",
  streams: [
    {
      level: "trace",
      stream: process.stdout
    },
    {
      level: "error",
      path: path.resolve(process.cwd(), "logs", "error.log"),
      type: "file",
      period: "1d",
      count: 3
    }
  ]
});

module.exports = {
  log
};
