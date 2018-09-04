const { appSyncInit } = require("./controllers/index");
const { log } = require("../../logs/index");

async function main() {
  log.info({}, "To appSyncInit");
  await appSyncInit();
  log.info({}, "Has appSyncInit");
}

main();
