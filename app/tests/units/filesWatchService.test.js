const path = require("path");
const {
  observeFileChange
} = require("../../koaspace/services/filesWatchService");
const {
  writeFilePromise,
  appendFilePromise,
  unlinkPromise
} = require("../../koaspace/utils/fsPromisify");

describe("[ Files Watch Service Unit Tets ]", () => {
  /** After the watcher is registered, watchFileCreation should listen to "add"
   * event upon a file creation. And return the
   */
  test("[ observeFileCreation ]", done => {
    try {
      expect.assertions(3);
      const tempPath = path.resolve(process.cwd(), "app", "temp3.txt");
      observeFileChange().subscribe({
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
