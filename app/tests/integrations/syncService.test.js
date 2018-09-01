// const { syncFromRemote } = require("../../koaspace/services/syncService");

describe("[ syncService Integration Test ]", () => {
  /** Steps
   * 1. Prepare 2 remoteUpdated files and insert into to DB
   * 2. Upload 2 prepare files to S3
   * 3. Delete 2 files from local
   * 4. Call syncFromRemote and check the download files and see if remoteUpdated flag has been
   * changed to "0"
   * 5. Clean up files - Remove from S3 & Remove from DB
   */
  test("[ syncFromRemote - Downloaded remnoted updated fle and update the remoteUpdated flag to 0 ]", async () => {
    expect(false).toBeTruthy();
  });
});
