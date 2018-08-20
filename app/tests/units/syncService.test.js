const path = require("path");
const {
  // syncToBucketExec,
  // intitalFilesSync,
  syncToBucketSpawn
} = require("../../koaspace/services/syncService");

const { ROOT_PATH, S3_BUCKET_URL } = require("../../koaspace/const");
const { s3BucketFilePathbuilder } = require("../../koaspace/utils/helpers");

describe("[ Sync Service Units Test ]", () => {
  /**  */
  test("[ Test - syncToBucket ]", async done => {
    try {
      const sourcePath = path.resolve(ROOT_PATH, "app", "tests");
      const s3RootPath = s3BucketFilePathbuilder(S3_BUCKET_URL, sourcePath);
      const syncToBucketObservable = syncToBucketSpawn(ROOT_PATH, s3RootPath);
      syncToBucketObservable.subscribe({
        next(data) {
          console.log(`Next Data from osyncToBucketSpawn observable: ${data}`);
          expect(data).toBeTruthy();
        },
        error(data) {
          throw new Error(data);
        },
        complete(data) {
          console.log(
            `Completed Data from osyncToBucketSpawn observable: ${data}`
          );
          expect(data).toBeTruthy();
          done();
        }
      });
    } catch (err) {
      throw new Error(
        `Error occurs in [ Sync Service Units Test ] : ${err.message}`
      );
    }
  });
});
