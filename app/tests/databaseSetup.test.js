const { sequelize } = require("../koaspace/database/setup");
const { User } = require("../koaspace/models/User");
const { File } = require("../koaspace/models/File");

describe("DB Moudle", () => {
  /** Testing db connection */
  test("[ DB Setup Connection Test ]", async () => {
    expect.assertions(1);
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });

  /** Testing db tables sync */
  test("[ DB Tables Sync Test ]", async () => {
    expect.assertions(2);
    await expect(User.sync()).resolves.toBeTruthy();
    await expect(File.sync()).resolves.toBeTruthy();
  });

  /** Find seedUser and if not exist create one in development mode */
  test("[ DB Import Seed User if not existed ]", async () => {
    expect.assertions(1);
    const user = await createSeedUser();
    expect(user.username).toBe("james.lo");
  });
});
