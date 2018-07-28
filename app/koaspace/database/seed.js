const { User } = require("../models/User");

const userParams = {
  username: "james",
  password: "james123",
  profileId: "KS00000002",
  email: "james@example.com",
  displayName: "James",
  securityGroup: "Admin"
};

module.exports = {
  userParams
};
