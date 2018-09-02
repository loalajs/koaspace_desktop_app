const path = require("path");
const {
  observeFileChange
} = require("../../koaspace/services/filesWatchService");
const {
  writeFilePromise,
  appendFilePromise,
  unlinkPromise
} = require("../../koaspace/utils/fsPromisify");
const { IGNORED_PATH } = require("../../koaspace/const");
const {
  transformPathsFromArrayToRegexp
} = require("../../koaspace/utils/helpers");
const { createTestFile, deleteTestDir } = require("../helpers/index");

const IGNORED_PATH_REGEXP = transformPathsFromArrayToRegexp(IGNORED_PATH);

describe("[ Files Watch Service Unit Tets ]", () => {
  /** After the watcher is registered, watchFileCreation should listen to "add"
   * event upon a file creation. And return the
   */
  test("[ observeFileCreation ]", async done => {
    try {
      const testDirName = "test_observeFileCreation";
      const tempPath = await createTestFile("temp3.txt", testDirName);
      const watchDir = path.dirname(tempPath);
      observeFileChange(watchDir, {
        ignored: IGNORED_PATH_REGEXP,
        ignoreInitial: true
      }).subscribe({
        async next(value) {
          console.log(`${value.event}`);
          if (value.event === "ready") {
            await writeFilePromise(tempPath, "Hello loala");
          } else if (value.event === "add") {
            expect(value).toEqual({ event: "add", filePath: tempPath });
            await appendFilePromise(value.filePath, "Extra Hello!");
          } else if (value.event === "change") {
            expect(value).toEqual({ event: "change", filePath: tempPath });
            await unlinkPromise(value.filePath);
          } else if (value.event === "unlink") {
            expect(value).toEqual({ event: "unlink", filePath: tempPath });
            await expect(deleteTestDir(watchDir)).toBeTruthy();
            done();
          } else {
            throw new Error(`Unrecognise event value: ${value}`);
          }
        },
        error(err) {
          throw new Error(
            `Error occurs in observeFileCreation test: ${err.message} `
          );
        }
      });
    } catch (err) {
      throw new Error(
        `Error occurs in observeFileCreation test - ${err.message}`
      );
    }
  });
});
