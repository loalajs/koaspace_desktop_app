const path = require("path");
const {
  writeFilePromise,
  appendFilePromise
} = require("../../koaspace/utils/fsPromisify");

const {
  removeDir,
  checkDir,
  mkdirp
} = require("../../koaspace/utils/fsPromisify");

const { ROOT_PATH } = require("../../koaspace/const");

/** Get temp path */
function getTempPath(filename, dirName) {
  if (!dirName || !filename)
    throw new Error(`dirName and fileName cannot be undefined`);
  return path.resolve(ROOT_PATH, "app", dirName, filename);
}

/** Create temp file in the /app directory
 * @param filename: String
 * @param dirName: String
 * @return fullPath: String
 */
async function createTestFile(filename, dirName) {
  try {
    const fullPath = getTempPath(filename, dirName);
    const dirname = path.dirname(fullPath);
    if (!(await checkDir("d", dirname))) {
      await mkdirp(dirname);
    }
    if (await writeFilePromise(fullPath, "Hello world!")) {
      return fullPath;
    }
    throw new Error(`createTestFile did not write file to ${fullPath}`);
  } catch (err) {
    throw new Error(`Error occurs in createTestFile`);
  }
}

/** Delete temp in the /app directory file
 * @param dirName: String
 * @param Promise<Boolean>
 */
function deleteTestDir(dirName) {
  try {
    const fullPath = path.resolve(ROOT_PATH, "app", dirName);
    return removeDir(fullPath);
  } catch (err) {
    throw new Error(`Error occurs in deleteTestDir: ${err.message}`);
  }
}

/** append test contents to a test file */
function appendTestContents(filename, dirName, contents) {
  const filePath = getTempPath(filename, dirName);
  return appendFilePromise(filePath, contents);
}

module.exports = {
  createTestFile,
  deleteTestDir,
  appendTestContents
};
