const { s3BucketFilePathbuilder } = require("../../koaspace/utils/helpers");
const { S3_BUCKET_URL } = require("../../koaspace/const");

describe(" S3 Module Unit Tests ", () => {
  /** TEST s3BucketFilePathbuilder Test the s3 target path generation
   * For example: /Users/path/to/root/app/index.js should be transformed into
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
});
