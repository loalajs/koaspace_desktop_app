const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "env") });

const ROOT_PATH = process.cwd();
const S3_BUCKET_URL = process.env.S3_BUCKET_URL;
const S3_SYNC_EXCLUDE = `--exclude "*node_modules/*" --exclude "*.git/*" --exclude "env"`;
// const IGNORED_PATH = /node_modules|\.git|env/;
const IGNORED_PATH = ["node_modules", ".git", "env"];
const S3_PROFILE = process.env.S3_PROFILE;
const S3_REGION = process.env.S3_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_API_VERSION = process.env.S3_API_VERSION;
module.exports = {
  ROOT_PATH,
  S3_BUCKET_URL,
  S3_SYNC_EXCLUDE,
  IGNORED_PATH,
  S3_PROFILE,
  S3_REGION,
  S3_BUCKET_NAME,
  S3_API_VERSION
};
