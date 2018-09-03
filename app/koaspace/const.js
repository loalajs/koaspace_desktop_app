const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "env") });

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

const ROOT_PATH = process.cwd();
const S3_BUCKET_URL = process.env.S3_BUCKET_URL;
const S3_SYNC_EXCLUDE = `--exclude "*node_modules/*" --exclude "*.git/*" --exclude "*env"`;
const IGNORED_PATH = ["node_modules", ".git", "env"];
const S3_PROFILE = process.env.S3_PROFILE;
const S3_REGION = process.env.S3_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_API_VERSION = process.env.S3_API_VERSION;

let ADMIN_USER_ID = "";
let DB_USER = "";
let DB_NAME = "";
let DB_PASSWORD = "";
let DB_HOST = "";
let DB_DIALECT = "";

/** PROD CONFIG */
if (NODE_ENV === "production") {
  /** PROD Users Management */
  ADMIN_USER_ID = process.env.PROD_ADMIN_USER_ID;

  /** PROD DB */
  DB_NAME = process.env.DB_PROD_NAME;
  DB_USER = process.env.DB_PROD_USER;
  DB_PASSWORD = process.env.DB_PROD_PASSWORD;
  DB_HOST = process.env.DB_PROD_HOST;
  DB_DIALECT = process.env.DB_PROD_DIALECT;
} else if (NODE_ENV === "development") {
  /** Users Management */
  ADMIN_USER_ID = process.env.DEV_ADMIN_USER_ID;

  /** DB */
  DB_NAME = process.env.DB_DEV_NAME;
  DB_USER = process.env.DB_DEV_USER;
  DB_PASSWORD = process.env.DB_DEV_PASSWORD;
  DB_HOST = process.env.DB_DEV_HOST;
  DB_DIALECT = process.env.DB_DEV_DIALECT;
} else if (NODE_ENV === "test") {
  /** Users Management */
  ADMIN_USER_ID = process.env.TEST_ADMIN_USER_ID;

  /** DB */
  DB_NAME = process.env.DB_TEST_NAME;
  DB_USER = process.env.DB_TEST_USER;
  DB_PASSWORD = process.env.DB_TEST_PASSWORD;
  DB_HOST = process.env.DB_TEST_HOST;
  DB_DIALECT = process.env.DB_TEST_DIALECT;
}

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
