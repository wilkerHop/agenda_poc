const dotenv = require("dotenv");
const { resolve } = require("path");

const envFile = (process.env.NODE_ENV ?? "dev") + ".env";
dotenv.config({ path: resolve(__dirname, ".env", envFile) });
