const path = require("path");
const {
  writeFilePromise,
  unlinkPromise,
  appendFilePromise
} = require("../../koaspace/utils/fsPromisify");

const {
  removeDir,
  checkDir,
  mkdirp
} = require("../../koaspace/utils/fsPromisify");

const { ROOT_PATH } = require("../../koaspace/const");

/** Get temp path */
function getTempPath(filename) {
  return path.resolve(ROOT_PATH, "app", "test_filesService", filename);
}

/** Create temp file in the /app directory */
async function createTestFile(filename) {
  try {
    const fullPath = getTempPath(filename);
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

/** Delete temp in the /app directory file */
function deleteTestFile(filename) {
  const fullPath = getTempPath(filename);
  removeDir(path.dirname(fullPath));
  return unlinkPromise(fullPath);
}

/** append test contents to a test file */
function appendTestContents(filename, contents) {
  const filePath = getTempPath(filename);
  return appendFilePromise(filePath, contents);
}

module.exports = {
  createTestFile,
  deleteTestFile,
  appendTestContents
};
