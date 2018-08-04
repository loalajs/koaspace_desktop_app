const path = require("path");
const { s3BucketFilePathbuilder } = require("../../koaspace/utils/helpers");
const {
  deleteObjects,
  putObject
} = require("../../koaspace/services/s3StorageService");
const {
  unlinkPromise,
  readFilePromise,
  writeFilePromise
} = require("../../koaspace/utils/fsPromisify");
const { S3_BUCKET_URL, S3_BUCKET_NAME } = require("../../koaspace/const");

describe("S3 Module", () => {
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

  test("[ Added one file ]", () => {});

  test("[ Update one file ]", () => {});

  test("[ Initial Upload ]", () => {});
});
