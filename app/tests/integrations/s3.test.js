const path = require("path");
const {
  deleteObjects,
  putObject,
  downloadOneFromS3,
  downloadMultipleFromS3,
  uploadS3
} = require("../../koaspace/services/s3StorageService");
const {
  unlinkPromise,
  readFilePromise,
  writeFilePromise,
  mkdirp,
  removeDir,
  recurReaddir
} = require("../../koaspace/utils/fsPromisify");
const { S3_BUCKET_NAME, ROOT_PATH } = require("../../koaspace/const");

describe("S3 Module", () => {
  jest.setTimeout(50000);

  /** deleteObjects test if object can be deleted from S3 */
  test("[ deleteObjects ] delete object from s3 with file key", async () => {
    /** create file and delete it */
    /** key:  app/testUpload.txt
     *  body: hello world
     *  bucket-name: loala-test
     */
    const tempSourceFilePath = path.resolve(process.cwd(), "app", "temp2.txt");
    const tempTargetFilePath = path.relative(ROOT_PATH, tempSourceFilePath);
    try {
      await writeFilePromise(tempSourceFilePath, "Hello world");
      const data = await readFilePromise(tempSourceFilePath);
      const targetFileCreatedResult = await putObject(
        S3_BUCKET_NAME,
        tempTargetFilePath,
        data
      );
      expect(targetFileCreatedResult).toBeTruthy();
      const targetFileDeleteResult = await deleteObjects(S3_BUCKET_NAME, [
        { Key: tempTargetFilePath }
      ]);
      expect(targetFileDeleteResult).toBeTruthy();

      await expect(unlinkPromise(tempSourceFilePath)).resolves.toBeTruthy();
    } catch (err) {
      throw new Error(
        `Error occurs in test case: deleteObjects : ${err.message}`
      );
    }
  });

  /** 1. Upload a test file to S3 and delete it locally
   *  2. Called downloadOneFromS3 and save the file to the original temporary dir
   *  3. Check if file size is the same
   *  4. Clean test file both locally and remotely
   */
  test("[ downloadOneFromS3 ]", async () => {
    /** Create test dir and file */
    const downloadFilePath = path.resolve(
      ROOT_PATH,
      "app",
      "testdownloads3",
      "test.txt"
    );
    await mkdirp(path.dirname(downloadFilePath));
    await writeFilePromise(downloadFilePath, "Hello world");
    const data = await readFilePromise(downloadFilePath);

    /** Call upload and delete locally */
    await expect(
      putObject(S3_BUCKET_NAME, downloadFilePath, data)
    ).resolves.toBeTruthy();
    await removeDir(path.dirname(downloadFilePath));

    /** download data */
    await expect(
      downloadOneFromS3(S3_BUCKET_NAME, downloadFilePath)
    ).resolves.toBeTruthy();

    /** Check if file has been download to original dir */
    const downloaded = await readFilePromise(downloadFilePath);
    expect(downloaded).toEqual(data);

    /** data cleaning */
    await removeDir(path.dirname(downloadFilePath));
    await deleteObjects(S3_BUCKET_NAME, [{ Key: downloadFilePath }]);
  });

  test("[ downloadMultipleFromS3 test ]", async () => {
    /** Create test files */

    const downloadFilePath1 = path.resolve(
      ROOT_PATH,
      "app",
      "test_multiple_downloads3",
      "test1.txt"
    );
    const downloadFilePath2 = path.resolve(
      ROOT_PATH,
      "app",
      "test_multiple_downloads3",
      "test2.txt"
    );
    const downloadFileDir = path.dirname(downloadFilePath1);
    await mkdirp(downloadFileDir);
    await writeFilePromise(downloadFilePath1, "Hello world - 1");
    await writeFilePromise(downloadFilePath2, "Hello world - 2");
    const data1 = await readFilePromise(downloadFilePath1);
    const data2 = await readFilePromise(downloadFilePath2);

    /** Upload test files */

    await expect(
      uploadS3(S3_BUCKET_NAME, downloadFilePath1, data1)
    ).resolves.toBeTruthy();
    await expect(
      uploadS3(S3_BUCKET_NAME, downloadFilePath2, data2)
    ).resolves.toBeTruthy();

    /** Clean the local files after upload */
    await expect(unlinkPromise(downloadFilePath1)).toBeTruthy();
    await expect(unlinkPromise(downloadFilePath2)).toBeTruthy();
    const filelist = [downloadFilePath1, downloadFilePath2];

    /** Download files */
    await expect(
      downloadMultipleFromS3(S3_BUCKET_NAME, filelist)
    ).resolves.toBeTruthy();
    const downloadedFileList = await recurReaddir(downloadFileDir);

    /** Check download files */
    expect(downloadedFileList).toHaveLength(2);

    /** Clean files */
    await removeDir(downloadFileDir);
    await deleteObjects(S3_BUCKET_NAME, [
      { Key: downloadFilePath1 },
      { Key: downloadFilePath2 }
    ]);
  });
});
