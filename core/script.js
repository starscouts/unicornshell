const fs = require('fs');
const path = require('path');

require('./history');
require('./keyboard');
require('./ui');
require('./prompt');

let file = null;

try {
    file = fs.readFileSync(global.scriptName).toString().trim();
} catch (e) {}

if (!file) {
    error("Unable to find script: " + path.resolve(global.scriptName));
    return;
}

process.env["SHELL"] = "unish";
global.directory = process.cwd();
global.env = {};

for (let key of Object.keys(process.env)) {
    if (key === "PKG_EXECPATH") break;
    global.env[key] = process.env[key];
}

let lines = file.split("\n").map(i => i.trim()).filter(i => i.trim() !== "");

(async () => {
    await require('./profile')();

    for (let line of lines) {
        await processLine(line, false);
    }
})();