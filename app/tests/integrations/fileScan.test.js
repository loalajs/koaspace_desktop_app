const path = require("path");
const { ROOT_PATH, IGNORED_PATH } = require("../../koaspace/const");
const {
  writeFilePromise,
  unlinkPromise,
  recurReaddir,
  appendFilePromise,
  mkdirPromise,
  removeDir
} = require("../../koaspace/utils/fsPromisify");
const {
  observeFileChange
} = require("../../koaspace/services/filesWatchService");

const {
  fileBulkDeleteByPathList,
  deleteOneFileByPath,
  updateFileFromDB,
  getOneFileByPath
} = require("../../koaspace/services/filesService");

const {
  scanAllToDB,
  scanFileToDB
} = require("../../koaspace/services/filesScanService");
const {
  transformPathsFromArrayToRegexp
} = require("../../koaspace/utils/helpers");

const IGNORED_PATH_REGEXP = transformPathsFromArrayToRegexp(IGNORED_PATH);

/** Scan file is process that save the file metadata to database before it is sync to s3 */
describe(`[ Files Scan Module ]`, () => {
  /** Initial Scan should scan all of files in the local source dir to database
   * Step 1. Scan all files to DB
   * Step 2. Delete all files from database
   */
  test(`[ Initial Directory Scan - Add all file to database ]`, async () => {
    /** Scan all the db */
    const scanPath = path.resolve(ROOT_PATH, "app", "tests");

    await expect(
      scanAllToDB(scanPath, {
        filterDirs: IGNORED_PATH
      })
    ).resolves.toBeTruthy();

    /** Clearup test data in DB */
    const filePathList = await recurReaddir(scanPath, {
      filterDirs: IGNORED_PATH
    });
    await expect(fileBulkDeleteByPathList(filePathList)).resolves.toBeTruthy();
  });
  /** Scan new file to database
   * Step 1: Register the files watcher
   * Step 2: Create a file
   * Step 3: Check if the file has been saved to db
   * Step 4. Delete the file
   * */
  test(`[ Watch Files Changes - Add, Update and Delete files in database ]`, async done => {
    try {
      // expect.assertions(8);
      const tempFilePath = path.resolve(
        process.cwd(),
        "app",
        "testwatch1",
        "temp4.txt"
      );

      const watchDir = path.dirname(tempFilePath);
      await expect(mkdirPromise(watchDir)).resolves.toBeTruthy();
      /** Step 1: Resgister the file watcher */
      const fileWatchObservable = observeFileChange(watchDir, {
        ignored: IGNORED_PATH_REGEXP,
        ignoreInitial: true
      });
      fileWatchObservable.subscribe({
        async next({ event, filePath }) {
          if (event === "ready") {
            /** Write and create new file */
            console.log(`Debug - READY`);
            await writeFilePromise(tempFilePath, "hello world");
          } else if (event === "add") {
            /** Save new file to DB  */
            await expect(scanFileToDB(filePath)).resolves.toBeTruthy();

            /** Append some contents */
            await expect(
              appendFilePromise(filePath, "Extra Hello world")
            ).resolves.toBeTruthy();
            console.log(`Debug - ADD`);
          } else if (event === "change") {
            /** Update the file counter and metadata from DB */
            await updateFileFromDB(filePath);

            /** Check the metadata */
            const updated = await getOneFileByPath(filePath);
            expect(updated).toBeTruthy();
            expect(updated.counter).toBeGreaterThan(0);

            /** Physically delete the file  */
            await expect(unlinkPromise(tempFilePath)).resolves.toBeTruthy();

            console.log(`Debug - CHANGE`);
          } else if (event === "unlink") {
            /** Delete from DB */
            const deleteResult = await deleteOneFileByPath(filePath);
            expect(deleteResult).toBeTruthy();
            await expect(removeDir(watchDir)).toBeTruthy();
            done();
            console.log(`Debug - UNLINK`);
          }
        }
      });
    } catch (err) {
      throw new Error(
        `Error in tes case [ Watch Files Changes - Add, Update and Delete files in database ] : ${
          err.message
        }`
      );
    }
  });
});
