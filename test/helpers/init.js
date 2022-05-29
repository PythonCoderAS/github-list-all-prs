const { resolve } = require("path");
process.env.TS_NODE_PROJECT = resolve("test/tsconfig.json");
process.env.NODE_ENV = "development";

// @ts-ignore
global.oclif = global.oclif || {};
// @ts-ignore
global.oclif.columns = 80;
