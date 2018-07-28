const { createSeedUser } = require("./seed");

async function create() {
  await createSeedUser();
  process.exit();
}

create();
