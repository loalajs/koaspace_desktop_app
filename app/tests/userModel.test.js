const { User } = require("../koaspace/models/User");

describe("[ User Model ]", () => {
  /** Testing adding a dummy user */
  test("[ Add Dummy User ]", async () => {
    const userParams = {
      username: "james",
      password: "james123",
      profileId: "KS00000001",
      email: "james@example.com",
      displayName: "James",
      securityGroup: "Admin"
    };
    const newUser = await User.create(userParams);
    expect(newUser.username).toBe("james");
  });

  test("[ Add Duplicate Dummy User ]", async () => {
    const duplicatedUserParam = {
      username: "james",
      password: "james123",
      profileId: "KS00000001",
      email: "james@example.com",
      displayName: "James",
      securityGroup: "Admin"
    };
    await expect(User.create(duplicatedUserParam)).rejects.toThrow();
  });

  test("[ Add Invalid Dummy User ]", async () => {
    const invalidUser = {
      username: "james123",
      password: "james123",
      profileId: "KS00000001",
      email: "invalidemail",
      displayName: "James",
      securityGroup: "Admin"
    };
    await expect(User.create(invalidUser)).rejects.toThrow();
  });

  test("[ Update Dummy User ]", async () => {
    const set = {
      displayName: "James Lo",
      profileActive: true
    };
    const [row] = await User.update(set, {
      where: { username: "james" }
    });
    expect(row).toBeGreaterThan(0);
  });
  test("[ Get Dummy User ]", async () => {
    const user = await User.findOne({ where: { username: "james" } });
    expect(user.username).toBe("james");
  });
  test("[ Remove Dummy User ]", async () => {
    await expect(
      User.destroy({
        where: {
          username: "james"
        }
      })
    ).resolves.toBeTruthy();
  });
});
