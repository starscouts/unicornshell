const fs = require('fs');

process.on('SIGINT', () => {

});

try {
    if (!fs.existsSync(process.env.HOME + "/.unish")) fs.mkdirSync(process.env.HOME + "/.unish");
} catch (e) {
    console.log(require('chalk').red("Error: ") + "Unable to create " + process.env.HOME + "/.unish, configuration and history saving are disabled.");
}

try {
    if (!fs.existsSync(process.env.HOME + "/.unish/history.txt")) fs.writeFileSync(process.env.HOME + "/.unish/history.txt", "");
} catch (e) {
    console.log(require('chalk').red("Error: ") + "Unable to create " + process.env.HOME + "/.unish/history.txt, configuration and history saving are disabled.");
}

require('./history');
require('./keyboard');
require('./ui');
require('./prompt');

console.log("Welcome to Unicorn Shell, the modern pony shell.\n© 2023 Equestria.dev Developers\n");

process.env["SHELL"] = "unish";
global.directory = process.cwd();
global.env = process.env;
delete global.env["PKG_EXECPATH"];

global.delimiters = [" ", ",", ".", "-", "_"];
refreshPS1();
global.cursor = 0;
global.buf = "";

(async () => {
    await require('./profile')();
    prompt();
})();