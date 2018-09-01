const path = require("path");
const { syncFromRemote } = require("../../koaspace/services/syncService");
const { createTestFile, deleteTestDir } = require("../helpers/index");
const { scanAllToDB } = require("../../koaspace/services/filesScanService");
const { putObject } = require("../../koaspace/services/s3StorageService");
const { S3_BUCKET_NAME } = require("../../koaspace/const");
const { readFilePromise } = require("../../koaspace/utils/fsPromisify");
const {
  toggleFilesRemoteUpdatedFlag
} = require("../../koaspace/services/filesService");

describe("[ syncService Integration Test ]", () => {
  /** Steps
   * 1. Prepare 2 remoteUpdated files and insert into to DB & Update their remoteUpdated flag to 1
   * 2. Upload 2 prepare files to S3
   * 3. Delete 2 files from local
   * 4. Call syncFromRemote and check the download files and see if remoteUpdated flag has been
   * changed to "0"
   * 5. Clean up files - Remove from S3 & Remove from DB
   */
  test("[ syncFromRemote - Downloaded remnoted updated fle and update the remoteUpdated flag to 0 ]", async () => {
    /** 1. Prepare 2 remoteUpdated files and insert into to DB */
    const testDirName = "test_syncFromRemote";
    const testFilePath1 = await createTestFile("test1.txt", testDirName);
    const testFilePath2 = await createTestFile("test2.txt", testDirName);
    const testDir = path.dirname(testFilePath1);
    await expect(scanAllToDB(testDir)).resolves.toBeTruthy();
    const testData2 = await readFilePromise(testFilePath2);
    await expect(
      toggleFilesRemoteUpdatedFlag([testFilePath1, testFilePath2])
    ).resolves.toBeTruthy();

    /** 2. Upload 2 prepare files to S3 */
    await Promise.all(
      [testFilePath1, testFilePath2].map(filePath =>
        putObject(S3_BUCKET_NAME, filePath, testData2)
      )
    );

    /** 3. Delete 2 files from local */
    await expect(deleteTestDir(testDir)).resolves.toBeTruthy();

    /** 4. Call syncFromRemote and check the download files and see if remoteUpdated flag has been changed to "0" */
    await expect(syncFromRemote()).resolves.toBeTruthy();

    /** 5. Clean up files - Remove from S3 & Remove from DB */
    await expect(deleteTestDir(testDir)).resolves.toBeTruthy();
  });
});
