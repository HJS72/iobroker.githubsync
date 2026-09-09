const path = require("path");
const { tests } = require("@iobroker/testing");

// Validates package.json / io-package.json consistency (version match, required fields, ...)
tests.packageFiles(path.join(__dirname, ".."));
