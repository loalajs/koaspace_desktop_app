const { appInit, appSync } = require("./controllers/index");

async function main() {
  /** Init, scan all root files to DB and upload to S3 */
  await appInit();

  /** Constantly wastch the root dir and scan & upload to S3 */
  appSync();
}

main();
