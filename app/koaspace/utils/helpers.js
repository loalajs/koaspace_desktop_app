const { exec, spawn } = require("child_process");
const path = require("path");
const { ROOT_PATH } = require("../const");
const { Observable } = require("rxjs");

/** execPromise is promisified exec function from NodeJs child_process
 * @param command: string
 * command is shell command such ls, mkdir and etc...
 */
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr.trim());
      }
      resolve(stdout.trim());
    });
  });
}

/** spawn */
function spawnObservable(command, args) {
  const cli = spawn(command, args);
  return new Observable(observer => {
    cli.stdout.on("data", data => {
      observer.next(data);
    });
    cli.stderr.on("data", err => {
      observer.error(err);
    });
    cli.on("close", code => {
      console.log(`Child process existed with the code: ${code}`);
      observer.complete(`Done - : ${code}`);
    });
  });
}

/** transformPathsFromArrayToRegexp transform the array of path to regexp
 * @param paths: String[]
 * @return RegExp
 */
function transformPathsFromArrayToRegexp(paths) {
  const regexp = paths.join("|");
  return new RegExp(regexp, "ig");
}

/** s3BucketPathbuilder transform a file or dir path from source to target
 * by prefixing s3://S3_BUCKET_NAME/mirror/source/path
 * @param s3BucketRoot: String
 * @param sourceFilePath: String
 * @return targetFilePath: String
 */
function s3BucketFilePathbuilder(s3BucketRoot, sourceFilePath) {
  let targetFilePath = path.relative(ROOT_PATH, sourceFilePath);
  targetFilePath = `${s3BucketRoot}/${targetFilePath}`;
  return targetFilePath;
}

/** Get current time string in format: YYYY-MM-DD HH:MM:SS
 * @return String
 */
function getCurrentTimeStampISO() {
  /** offset in milliseconds */
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOTime = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  return localISOTime;
}

module.exports = {
  execPromise,
  transformPathsFromArrayToRegexp,
  s3BucketFilePathbuilder,
  getCurrentTimeStampISO,
  spawnObservable
};
