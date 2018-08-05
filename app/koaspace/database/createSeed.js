const { createSeedUser } = require("./seeders/seed");

async function create() {
  await createSeedUser();
  process.exit();
}

create();
