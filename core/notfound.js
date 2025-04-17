const Fuse = require('fuse.js');

let list = [...new Set([...Object.keys(require('./builtins')), ...getCommands().map(i => require('path').basename(i))])];
const fuse = new Fuse(list)

global.notFound = (command) => {
    let results1 = fuse.search(command).map(i => i.item).filter(i => i.length === command.length);
    let results2 = fuse.search(command).map(i => i.item).filter(i => i.length !== command.length);
    let results = [...results1, ...results2];

    if (results.length > 0) {
        error("Command not found: " + command + ". Did you mean \"" + results[0] + "\"?");
    } else {
        error("Command not found: " + command);
    }
}