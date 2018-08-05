const { User } = require("../models/User");

function createSeedUser() {
  const userParams = {
    username: "james.lo",
    password: "jameslo",
    profileId: "KS00000002",
    email: "james@koaspace.com",
    displayName: "James",
    securityGroup: "Admin"
  };
  return User.findOrCreate({
    where: {
      username: "james.lo"
    },
    defaults: userParams
  });
}

module.exports = {
  createSeedUser
};
