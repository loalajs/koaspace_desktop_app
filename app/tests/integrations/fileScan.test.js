const path = require("path");
const { ROOT_PATH, IGNORED_PATH } = require("../../koaspace/const");
const {
  writeFilePromise,
  unlinkPromise,
  recurReaddir,
  appendFilePromise
} = require("../../koaspace/utils/fsPromisify");
const {
  observeFileChange
} = require("../../koaspace/services/filesWatchService");

const {
  fileBulkDeleteByPathList,
  deleteOneFileByPath,
  updateFileFromDB
} = require("../../koaspace/services/filesService");

const {
  scanAllToDB,
  scanFileToDB
} = require("../../koaspace/services/filesScanService");

/** Scan file is process that save the file metadata to database before it is sync to s3 */
describe(`[ Files Scan Module ]`, () => {
  /** Initial Scan should scan all of files in the local source dir to database
   * Step 1. Scan all files to DB
   * Step 2. Delete all files from database
   */
  test(`[ Initial Directory Scan - Add all file to database ]`, async () => {
    /** Scan all the db */
    await expect(
      scanAllToDB(ROOT_PATH, {
        filterDirs: IGNORED_PATH
      })
    ).resolves.toBeTruthy();

    /** Clearup test data in DB */
    const filePathList = await recurReaddir(ROOT_PATH, {
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
  test(`[ Watch Files Changes - Add one to database ]`, done => {
    const tempFilePath = path.resolve(process.cwd(), "app", "temp4.txt");
    /** Step 1: Resgister the file watcher */
    const fileWatchObservable = observeFileChange();
    fileWatchObservable.subscribe({
      async next({ event, filePath }) {
        if (event === "ready") {
          /** Write and create new file */
          await writeFilePromise(filePath, "hello world");
        } else if (event === "add") {
          /** Save new file to DB  */
          await expect(scanFileToDB(filePath)).resolves.toBeTruthy();

          /** Append some contents */
          await expect(
            appendFilePromise(filePath, "Extra Hello world")
          ).resolves.toBeTruthy();
        } else if (event === "change") {
          /** Update the file counter and metadata from DB */
          const updated = await updateFileFromDB(filePath);

          /** Check the metadata */
          expect(updated).resolves.toBeTruthy();
          expect(updated.counter).toBeGreaterThan(0);

          /** Physically delete the file  */
          await expect(unlinkPromise(tempFilePath).resolves.toBeTruthy());
        } else if (event === "unlink") {
          /** Delete from DB */
          await deleteOneFileByPath(filePath);
          done();
        }
      }
    });
  });
});
