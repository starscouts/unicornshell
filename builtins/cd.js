const path = require('path');
const fs = require("fs");

module.exports = (parameters, output) => {
    if (fs.existsSync(path.resolve(parameters[0] ?? global.env.HOME))) {
        global.directory = path.resolve(parameters[0] ?? global.env.HOME);
        process.chdir(directory);
        refreshPS1();
    } else {
        error("No such file or directory: " + path.resolve(parameters[0] ?? global.env.HOME));
    }
}