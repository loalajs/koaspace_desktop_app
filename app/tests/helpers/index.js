const path = require("path");
const {
  writeFilePromise,
  unlinkPromise,
  appendFilePromise
} = require("../../koaspace/utils/fsPromisify");

/** Get temp path */
function getTempPath(filename) {
  return path.resolve(process.cwd(), "app", filename);
}

/** Create temp file in the /app directory */
async function createTestFile(filename) {
  const fullPath = getTempPath(filename);
  if (await writeFilePromise(fullPath, "Hello world!")) {
    return fullPath;
  }
  throw new Error(`Cannot create Test Files`);
}
/** Delete temp in the /app directory file */
function deleteTestFile(filename) {
  const fullPath = getTempPath(filename);
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
