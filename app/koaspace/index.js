const { appInit, appSync } = require("./controllers/index");
const { log } = require("../../logs/index");

async function main() {
  /** Init, scan all root files to DB and upload to S3 */
  // await appInit();

  /** Constantly wastch the root dir and scan & upload to S3 */
  // appSync();
  log.debug(`Test debug`);
  log.info(`test info`);
  log.error("test error");
}

main();
