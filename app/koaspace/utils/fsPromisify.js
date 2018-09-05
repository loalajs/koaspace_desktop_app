const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const { execPromise } = require("./helpers");
const { Observable } = require("rxjs");
const { log } = require("../../../logs/index");

/** Promise version of fs.readdir
 * @param filePath: String
 * @param options: Config object for the readdir
 * @prop options.filterDirs: String[]
 * @return Promise<String[filename]>
 */
function promiseReaddir(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const filterDirs = options.filterDirs || {};
    fs.readdir(filePath, (err, list) => {
      if (err) reject(err);
      /** Step
       * Goal: Filter the directories found in the array
       * 1. Find if list contains items from the filterDirs array
       * 2. If found , remove them before resolve
       */
      let returnList = list;
      if (filterDirs.length > 0) {
        returnList = list.filter(item => filterDirs.indexOf(item) === -1);
      }
      resolve(returnList);
    });
  }).catch(err => {
    throw new Error(`Unexpected error in promiseReaddir: ${err}`);
  });
}

/** Promise version of fs.stat
 * @param filePath:String. The file or dir filePath
 * @returns Promise<String> The stats of the file or dir
 */
function promiseStat(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err == null) {
        resolve(stats);
      } else {
        reject(err);
      }
    });
  }).catch(err => {
    throw new Error(`Error occurs in promiseStat: ${err}`);
  });
}

/** Parallel Loop to read files recursively
 * @param dir string as the target directory
 * @param options: Config object for the readdir
 * @prop options.filterDirs: String[]
 * @return string[] as files path
 * @TODO: Add read stream version
 */
function recurReaddir(dir, options = {}) {
  return new Promise(async (resolve, reject) => {
    let results = [];
    try {
      const list = await promiseReaddir(dir, options);
      let pending = list.length;
      if (!pending) {
        /** Add empty directory into the results */
        results = results.concat(dir);
        resolve(results);
      }

      list.forEach(async file => {
        const fileFullPath = path.join(dir, file);
        const stats = await promiseStat(fileFullPath);
        if (stats && stats.isDirectory()) {
          const res = await recurReaddir(fileFullPath, options);
          results = results.concat(res);
          pending -= 1;
          if (!pending) resolve(results);
        } else {
          results.push(fileFullPath);
          pending -= 1;
          if (!pending) resolve(results);
        }
      });
    } catch (e) {
      reject(e);
    }
  }).catch(err => {
    throw new Error(`Unexpected error in resurReaddir: ${err}`);
  });
}

/** Promise version of fs.writeFile */
function writeFilePromise(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/** Promise version of fs.readFile */
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/** @TODO: test require
 * readFileStream is stream version of readFile. Combile with Observable makes
 * it easier to be reused anywhere in the application
 * @param filePath: String
 */
function readFileStream(filePath) {
  try {
    if (typeof filePath !== "string")
      throw new Error(`filePath - ${filePath} type is not string;`);
    const readStream = fs.createReadStream(filePath);
    return new Observable(observer => {
      readStream
        .on("data", chunk => {
          observer.next({ event: "data", data: chunk });
        })
        .on("end", () => {
          observer.complete({ event: "end" });
        })
        .on("error", err => {
          observer.error({ event: "error", err });
        });
    });
  } catch (err) {
    log.error({ err }, `Error occurs in readFileStream`);
    throw new Error(`Error occurs in readFileStream: ${err.message}`);
  }
}

/** Promise version of fs.unlink */
function unlinkPromise(filename) {
  return new Promise((resolve, reject) => {
    fs.unlink(filename, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/** Promise verison of fs.appendFile */
function appendFilePromise(
  filePath,
  data,
  option = { encoding: "utf8", mode: "0o666", flag: "a" }
) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, data, option, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/** Promise version of mkdir */
function mkdirPromise(dirpath, mode = 0o777) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirpath, mode, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/** removeDir recursively remove directory */
async function removeDir(dir) {
  try {
    return new Promise((resolve, reject) => {
      rimraf(dir, err => {
        if (err) reject(err);
        resolve(true);
      });
    });
  } catch (err) {
    throw new Error(`Error occurs in removeDir: ${err.message}`);
  }
}

/** mkdirp call mkdir -p dirname in linux / unix system
 * and return Promise<Boolean>
 */
async function mkdirp(dir) {
  try {
    const command = `mkdir -p ${dir}`;
    await execPromise(command);
    return Promise.resolve(true);
  } catch (err) {
    throw new Error(`Error occurs in mkdirp : ${err.message}`);
  }
}

/** checkDir check if a file or dir exists in the Unix & Linux system
 * @param mode : Char<"d" | "f">
 * @param objectPath : String. Dir or file path
 * @return Promise<Boolean
 */
async function checkDir(mode, objectPath) {
  try {
    if (mode !== "f" && mode !== "d")
      throw new Error(`Unrecognized mode in checkDir`);
    /** return string "true" or "false" */
    const shellScriptPath = path.resolve(__dirname, "checkDir.sh");
    const command = `sh ${shellScriptPath} ${mode} ${objectPath}`;
    const res = await execPromise(command);
    if (res === "true") {
      return Promise.resolve(true);
    } else if (res === "false") {
      return Promise.resolve(false);
    }
    throw new Error(`Unrecognized return from the checkDir.sh`);
  } catch (err) {
    throw new Error(`Error occurs in checkDir : ${err.message}`);
  }
}

module.exports = {
  recurReaddir,
  writeFilePromise,
  readFilePromise,
  unlinkPromise,
  promiseStat,
  appendFilePromise,
  mkdirPromise,
  removeDir,
  mkdirp,
  checkDir,
  readFileStream
};
