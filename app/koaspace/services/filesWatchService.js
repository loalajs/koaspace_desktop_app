const chokidar = require("chokidar");
const { ROOT_PATH, IGNORED_PATH } = require("../const");
const { transformPathsFromArrayToRegexp } = require("../utils/helpers");
const { recurReaddir } = require("../utils/fsPromisify");
const { Observable } = require("rxjs");

const IGNORED_PATH_REGEXP = transformPathsFromArrayToRegexp(IGNORED_PATH);

/** registerFileWatcher initial the chokidar watcher and return it
 * @param path: String
 * @param option: <chokidar Config Watcher Object f>
 */
function registerFileWatcher(wachtPath, option) {
  /** Files Registeration
   * TODO 1: Change the file path that is targeted for a watch
   */
  const watcher = chokidar.watch(wachtPath, option);
  return watcher;
}

/** First scan when app is initiating
 * Cannot use the watcher.on("all") becasue it is possible to predict
 * when the event is coming to end; Must use nodejs fs module
 * @param targetPath: String
 * The path the scan to begin with
 * @param option: Object. Default to {}
 * @property filterDirs: string[]
 * The path to filter
 */
async function initialFilesScan(targetPath, option = {}) {
  /**  M2 Save files meta data to database */
  console.log(`Initial files scanning begins`);
  try {
    const filesPath = await recurReaddir(targetPath, option);
    filesPath.forEach(filePath => {
      console.log(`${filePath}`);
    });
  } catch (err) {
    throw new Error(`Error occurs at initialFilesScan: ${err.message}`);
  }
}

function observableFileWatchReady() {
  try {
    const watch = registerFileWatcher(ROOT_PATH, {
      ignored: IGNORED_PATH_REGEXP,
      ignoreInitial: true
    });
    return new Observable(observer => {
      watch.on("ready", () => {
        observer.next(true);
      });
      return () => {
        watch.close();
      };
    });
  } catch (err) {
    throw new Error(
      `Error occurs in observableFileWatchReady : ${err.message}`
    );
  }
}

/** Watch for Files added */
function observeFileChange() {
  try {
    const watch = registerFileWatcher(ROOT_PATH, {
      ignored: IGNORED_PATH_REGEXP,
      ignoreInitial: true
    });
    return new Observable(observer => {
      watch
        .on("ready", () => {
          observer.next({ event: "ready" });
        })
        .on("add", filePath => {
          observer.next({ event: "add", filePath });
        })
        .on("change", filePath => {
          observer.next({ event: "change", filePath });
        })
        .on("unlink", filePath => {
          observer.next({ event: "unlink", filePath });
        })
        .on("error", error => {
          observer.error(error);
        });
      return () => {
        watch.close();
        // console.log(`Unsubscribe`);
      };
    });
  } catch (err) {
    throw new Error(`Error occurs in observeFileChange : ${err.message}`);
  }
}

module.exports = {
  initialFilesScan,
  registerFileWatcher,
  observeFileChange,
  observableFileWatchReady
};
