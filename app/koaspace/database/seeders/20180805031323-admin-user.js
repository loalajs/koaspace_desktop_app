const { getCurrentTimeStampISO } = require("../../utils/helpers");
const userParams = {
  username: "james.lo",
  password: "jameslo",
  profileId: "KS00000002",
  email: "james@koaspace.com",
  displayName: "James",
  securityGroup: "Admin",
  createdAt: getCurrentTimeStampISO(),
  updatedAt: getCurrentTimeStampISO()
};

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert("Users", [userParams]),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Users", {
      where: {
        username: "james.lo"
      }
    })
};
