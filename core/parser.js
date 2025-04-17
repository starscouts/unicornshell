require('./runtime');
require('./notfound');
const nodePath = require('path');
const fs = require('fs');
const chalk = require('chalk');

let builtins = require('./builtins');

function yesNo(def) {
    return new Promise((res) => {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let listener = (ch, key) => {
            if (key.sequence === "y" || key.sequence === "Y") {
                process.stdin.removeListener('keypress', listener);
                process.stdout.write(key.sequence + "\n");
                res(true);
            } else if (key.sequence === "n" || key.sequence === "N") {
                process.stdin.removeListener('keypress', listener);
                process.stdout.write(key.sequence + "\n");
                res(false);
            } else if (key.sequence === "\r" || key.sequence === "\n" || key.sequence === " ") {
                process.stdin.removeListener('keypress', listener);
                process.stdout.write("\n");
                res(def);
            }
        };

        process.stdin.addListener('keypress', listener);
    });
}

function substituteVariables(str) {
    for (let name of Object.keys(global.env)) {
        str = str.replace(new RegExp("(?<!\\\\)\\$" + name + "\\b", "g"), global.env[name]);
    }

    str = str.replace(/(?<!\\)\$[a-zA-Z\d_]+\b/g, "");

    return str;
}

function scandir(dir, recursive) {
    let list = [];

    if (fs.existsSync(dir)) {
        for (let file of fs.readdirSync(dir)) {
            if (recursive) {
                if (fs.existsSync(dir + "/" + file) && fs.statSync(dir + "/" + file).isDirectory()) {
                    list.push(dir + "/" + file);
                    list.push(...scandir(dir + "/" + file, true));
                } else if (fs.existsSync(dir + "/" + file)) {
                    list.push(dir + "/" + file);
                }
            } else {
                list.push(dir + "/" + file);
            }
        }
    } else {
        return [dir];
    }

    return list;
}

async function expendWildcards(parameter, ignoreWarning) {
    if (parameter.includes("**") || parameter.includes("*")) {
        let parts = parameter.replace(/(.*)(?<!\\)\*(.*)/g, "$1\t$2").split("\t");
        let recursive = false;

        if (parameter.includes("**")) {
            parts = parameter.replace(/(.*)(?<!\\)\*\*(.*)/g, "$1\t$2").split("\t");
            recursive = true;
        }

        if (parts.length !== 2) {
            return [parameter];
        } else {
            let start = parts[0];
            let end = parts[1];
            let directory;

            if (start.endsWith("/")) {
                directory = start;
            } else {
                directory = nodePath.dirname(start);
            }

            let allow;

            if (ignoreWarning || global.scriptMode) {
                allow = true;
            } else {
                if (start.trim() !== "" && end.trim() === "") {
                    process.stdout.write(chalk.yellow("Warning: ") + "The wildcard will expand to match all the files in " + nodePath.resolve(directory) + (recursive ? " recursively, " : "") + " starting with \"" + start + "\", expand? (y/N)");
                } else if (start.trim() === "" && end.trim() !== "") {
                    process.stdout.write(chalk.yellow("Warning: ") + "The wildcard will expand to match all the files in " + nodePath.resolve(directory) + (recursive ? " recursively, " : "") + " ending with \"" + end + "\", expand? (y/N)");
                } else if (start.trim() !== "" && end.trim() !== "") {
                    process.stdout.write(chalk.yellow("Warning: ") + "The wildcard will expand to match all the files in " + nodePath.resolve(directory) + (recursive ? " recursively, " : "") + " starting with \"" + start + "\" and ending with \"" + end + "\", expand? (y/N)");
                } else {
                    process.stdout.write(chalk.yellow("Warning: ") + "The wildcard will expand to match all the files in " + nodePath.resolve(directory) + (recursive ? " recursively" : "") + ", expand? (y/N)");
                }

                allow = await yesNo(false);
            }

            if (allow) {
                return scandir(directory, recursive).filter(i => {
                    if (i.startsWith("./")) {
                        return i.substring(2).startsWith(start) && i.substring(2).endsWith(end)
                    } else {
                        return i.startsWith(start) && i.endsWith(end)
                    }
                });
            } else {
                return null;
            }
        }
    }

    return [parameter];
}

function baseParse(str) {
    let result = [];

    let regex = /((([\w\-\/_()[\]{}!:=+@$~*.]|\\ )+)|("(.*?)")|('(.*?)'))/g;
    let groups = [2, 4, 6];
    let match;

    while ((match = regex.exec(str)) !== null) {
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        groups.forEach(function(group) {
            if (match[group]) {
                result.push(match[group]);
            }
        });
    }

    return result;
}

async function parse(str) {
    let argv = baseParse(substituteVariables(str));
    let command = argv[0];
    let parameters = [];
    let runCommand = true;

    for (let initial of argv.slice(1).map(i => i.replaceAll("\\", "").replace(/^('|")(.*)('|")$/gm, "$2"))) {
        let i = initial;
        let list = [i];
        let expend = i.replace(/(.*)(?<!\\)\*(.*)/g, "$1\t$2").replace(/(.*)(?<!\\)\*\*(.*)/g, "$1\t$2").includes("\t");

        while (expend) {
            let newList = [];

            for (let item of list) {
                let expanded = await expendWildcards(item);

                if (expanded) {
                    newList.push(...expanded);
                } else {
                    runCommand = false;
                }
            }

            list = newList;
            expend = false;

            for (let i of list) {
                if (expend) break;
                expend = i.replace(/(.*)(?<!\\)\*(.*)/g, "$1\t$2").replace(/(.*)(?<!\\)\*\*(.*)/g, "$1\t$2").includes("\t");
            }
        }

        parameters.push(...list.map(i => i.replaceAll("\\*", "*")));
    }

    if (runCommand) {
        return {
            command,
            parameters
        };
    } else {
        return {
            command: "abort",
            parameters: []
        };
    }
}

global.processLine = async (str, writeToHistory) => {
    if (str.startsWith("#")) return;

    if (!!str.match(/foreach (.*) {(.*)}/gm)) {
        if (writeToHistory) historyWrite(str);
        let parts = str.replace(/foreach (.*) {(.*)}/gm, "$1\t$2").split("\t");

        let list = await expendWildcards(parts[0], true);
        let valueBefore = global.env.it;

        for (let item of list) {
            global.env.it = item;
            await processLine(parts[1], false);
            global.env.it = valueBefore;
        }
    } else if (!!str.match(/forever {(.*)}/gm)) {
        if (writeToHistory) historyWrite(str);
        let parts = str.replace(/forever {(.*)}/gm, "$1").split("\t");

        while (true) {
            await processLine(parts[0], false);
        }
    } else if (!!str.match(/save (.*) {(.*)}/gm)) {
        if (writeToHistory) historyWrite(str);
        let parts = str.replace(/save (.*) {(.*)}/gm, "$1\t$2").split("\t");
        let variable = parts[0];

        if (variable.trim().replace(/^[a-zA-Z\d_]+$/gm, "") !== "") {
            error("Variable names can only contain alphanumeric characters and underscores.");
            return;
        }

        global.env[variable] = await execute(parts[1], false, true);
    } else {
        let list = str.split(";").filter(i => i.trim() !== "");

        for (let item of list) {
            await execute(item, writeToHistory);
        }
    }
}

global.execute = async (str, writeToHistory, returnOutput) => {
    if (writeToHistory) historyWrite(str);
    let parsed = await parse(str);

    if (global.parametersToAdd[parsed.command]) {
        parsed.parameters.unshift(...global.parametersToAdd[parsed.command]);
    }

    if (builtins[parsed.command]) {
        let output;
        let out = "";

        if (returnOutput) {

            output = (text) => {
                out += text + "\n";
            }
        } else {
            output = (text) =>  {
                console.log(text);
            }
        }

        builtins[parsed.command](parsed.parameters, output);

        if (returnOutput) {
            return out;
        }
    } else {
        let executable = resolve(parsed.command);

        if (executable) {
            if (fs.existsSync(executable)) {
                if (returnOutput) {
                    let proc = require('child_process').spawnSync(executable, parsed.parameters, {
                        argv0: parsed.command,
                        cwd: global.directory,
                        env: global.env,
                        windowsHide: true,
                        windowsVerbatimArguments: true,
                        shell: false,
                        stdio: ["ignore", "pipe", "inherit"]
                    });

                    return proc.stdout;
                } else {
                    require('child_process').spawnSync(executable, parsed.parameters, {
                        argv0: parsed.command,
                        cwd: global.directory,
                        env: global.env,
                        windowsHide: true,
                        windowsVerbatimArguments: true,
                        shell: false,
                        stdio: "inherit"
                    });
                }
            } else {
                notFound(parsed.command);
            }
        } else {
            notFound(parsed.command);
        }
    }
}