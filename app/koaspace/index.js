const { appInit, appSync } = require("./controllers/index");

/** @TODO:
 * 1. Allow user to specify the ROOT_PATH
 * 2. Allow user to specify ignore paths
 */
function Koaspace() {
  return {
    /** Init, scan all root files to DB and upload to S3 */
    init: appInit,
    /** Constantly wastch the root dir and scan & upload to S3 */
    sync: appSync
  };
}

module.exports = {
  Koaspace
};
