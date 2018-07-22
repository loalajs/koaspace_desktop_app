const exec = require("child_process").exec;
const path = require("path");
const { ROOT_PATH } = require("../const");

/** execPromise is promisified exec function from NodeJs child_process
 * * TODO: Use spawm instead of exec from child_process as exec buffer data in memory, which may cause memory leaks
 * @param command: string
 * command is shell command such ls, mkdir and etc...
 */
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      } else if (stderr) {
        reject(stderr.trim());
      }
      resolve(stdout.trim());
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

module.exports = {
  execPromise,
  transformPathsFromArrayToRegexp,
  s3BucketFilePathbuilder
};
