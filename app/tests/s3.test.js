const path = require("path");
const { s3BucketFilePathbuilder } = require("../koaspace/utils/helpers");
const {
  deleteObjects,
  putObject
} = require("../koaspace/services/s3StorageService");
const {
  unlinkPromise,
  readFilePromise,
  writeFilePromise
} = require("../koaspace/utils/fsPromisify");
const { S3_BUCKET_URL, S3_BUCKET_NAME } = require("../koaspace/const");

describe("S3 Module", () => {
  /** TEST s3BucketFilePathbuilder Test the s3 target path generation
   * For example: /User/path/to/root/app/index.js should be transformed into
   * s3://bucket-name/app/index.js
   */
  test("[ s3BucketFilePathbuilder ] tranform source file path to s3 path", () => {
    /** Testing file path */
    const soruceFilePath =
      "/Users/jameslo/Dropbox/myproject/koaspace-desktop/app/koaspace/index.js";
    const expectedFilePathResult = "s3://loala-test/app/koaspace/index.js";
    expect(s3BucketFilePathbuilder(S3_BUCKET_URL, soruceFilePath)).toBe(
      expectedFilePathResult
    );

    /** Testing Dir path */
    const soruceDirPath =
      "/Users/jameslo/Dropbox/myproject/koaspace-desktop/app/koaspace";
    const expectedDirPathResult = "s3://loala-test/app/koaspace";
    expect(s3BucketFilePathbuilder(S3_BUCKET_URL, soruceDirPath)).toBe(
      expectedDirPathResult
    );
  });

  /** deleteObjects test if object can be deleted from S3 */
  test("[ deleteObjects ] delete object from s3 with file key", async () => {
    /** create file and delete it */
    /** key:  app/testUpload.txt
     *  body: hello world
     *  bucket-name: loala-test
     */
    const tempSourceFilePath = path.resolve(process.cwd(), "app", "temp.txt");
    const tempTargetFilePath = s3BucketFilePathbuilder(
      S3_BUCKET_URL,
      tempSourceFilePath
    );
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

      expect(await unlinkPromise(tempSourceFilePath)).toBeTruthy();
    } catch (err) {
      throw new Error(
        `Error occurs in test case: deleteObjects : ${err.message}`
      );
    }
  });
});
