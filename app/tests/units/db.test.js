const { sequelize } = require("../../koaspace/database/setup");
const { File, User } = require("../../koaspace/models/index");
const { createSeedUser } = require("../../koaspace/database/seed");

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
    await createSeedUser();
    const user = await User.findOne({ where: { username: "james.lo" } });
    expect(user.username).toBe("james.lo");
  });
});
