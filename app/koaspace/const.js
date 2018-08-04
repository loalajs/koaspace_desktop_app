const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "env") });

const ROOT_PATH = process.cwd();
const S3_BUCKET_URL = process.env.S3_BUCKET_URL;
const S3_SYNC_EXCLUDE = `--exclude "*node_modules/*" --exclude "*.git/*" --exclude "env"`;
const IGNORED_PATH = ["node_modules", ".git", "env"];
const S3_PROFILE = process.env.S3_PROFILE;
const S3_REGION = process.env.S3_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_API_VERSION = process.env.S3_API_VERSION;

/** User Management */
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

/** DB */
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_DIALECT = process.env.DB_DIALECT;

module.exports = {
  ROOT_PATH,
  S3_BUCKET_URL,
  S3_SYNC_EXCLUDE,
  IGNORED_PATH,
  S3_PROFILE,
  S3_REGION,
  S3_BUCKET_NAME,
  S3_API_VERSION,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT,
  ADMIN_USER_ID
};
