const path = require("path");
const {
  writeFilePromise,
  unlinkPromise
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
  throw new Error(`Cannot create Test File`);
}
/** Delete temp in the /app directory file */
function deleteTestFile(filename) {
  const fullPath = getTempPath(filename);
  return unlinkPromise(fullPath);
}

module.exports = {
  createTestFile,
  deleteTestFile
};
