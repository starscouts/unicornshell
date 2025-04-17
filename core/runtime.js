const nodePath = require('path');
const fs = require('fs');

global.resolve = (command) => {
    let commands = getCommands();
    let resolved = null;

    if (command.startsWith("./") || command.startsWith("../") || command.startsWith("/")) {
        if (fs.existsSync(command)) {
            if (fs.lstatSync(command).isSymbolicLink()) {
                try {
                    resolved = fs.realpathSync(command);
                } catch (e) {}
            } else {
                resolved = command;
            }
        }
    } else {
        for (let file of commands) {
            if (nodePath.basename(file) === command) {
                if (fs.lstatSync(file).isSymbolicLink()) {
                    try {
                        resolved = fs.realpathSync(file);
                        break;
                    } catch (e) {}
                } else {
                    resolved = file;
                    break;
                }
            }
        }
    }

    return resolved;
}

global.getCommands = () => {
    let path = (process.env ?? global.env).PATH.split(":");
    let commands = [];

    for (let dir of path) {
        try {
            let list = fs.readdirSync(dir);

            for (let file of list) {
                commands.push(dir + "/" + file);
            }
        } catch (e) {}
    }

    return commands;
}