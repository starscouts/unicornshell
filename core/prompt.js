require('./parser');
const chalk = require("chalk");

global.refreshPS1 = () => {
    if (directory.startsWith(global.env.HOME)) {
        let directory = global.directory.substring(global.env.HOME.length);
        let parts = directory.split("/");

        if (parts.length > 4) {
            directory = parts[0] + "/" + parts[1] + "/…/" + parts[parts.length - 1];
        }

        global.ps1 = "US ~" + directory + "> ";
        global.ps1color = "🦄 " + chalk.yellow("~") + chalk.green(directory) + "> ";
    } else {
        let directory = global.directory;
        let parts = directory.split("/");

        if (parts.length > 4) {
            directory = parts[0] + "/" + parts[1] + "/…/" + parts[parts.length - 1];
        }
        
        global.ps1 = "US " + directory + "> ";
        global.ps1color = "🦄 " + chalk.green(directory) + "> ";
    }
}

global.prompt = async () => {
    global.buf = "";
    global.cursor = ps1.length;

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdout.write(ps1color);
    let input = true;

    global.inputHandler = async (char, key) => {
        if (key.sequence === "\x03") {
            historyPosition = 0;
            process.stdout.write("\n");
            global.buf = "";
            global.cursor = ps1.length;
            refreshLine();
        } else if (key.sequence === "\x04") {
            process.stdout.write("\n");
            process.exit();
        } else if (key.sequence === "\n" || key.sequence === "\r") {
            historyPosition = 0;
            refreshLine(true);
            process.stdout.write("\n");

            process.stdin.removeListener('keypress', inputHandler);
            process.stdin.setRawMode(false);
            process.stdin.pause();

            await processLine(buf, true);

            prompt();
        } else if (key.sequence === "\x1B[A" || key.sequence === "\x1B\x1B[A" || key.sequence === "\x1B[1;9A" || key.sequence === "\x1B[1;2A") {
            upKey();
        } else if (key.sequence === "\x1B[B" || key.sequence === "\x1B\x1B[B" || key.sequence === "\x1B[1;9B" || key.sequence === "\x1B[1;2B") {
            downKey();
        } else if (key.sequence === "\x1B[D" || key.sequence === "\x1B[1;2D") {
            leftKey();
        } else if (key.sequence === "\x1B[1;9D" || key.sequence === "\x1Bb") {
            leftWord();
        } else if (key.sequence === "\x1B[1;9C" || key.sequence === "\x1Bf") {
            rightWord();
        } else if (key.sequence === "\x1B[C" || key.sequence === "\x1B[1;2C") {
            rightKey();
        } else if (key.sequence === "\x7F") {
            backspace();
        } else if (key.sequence === "\x1B\x7F") {
            wordBackspace();
        } else if (key.sequence === "\x1B[3~") {
            del();
        } else if (key.sequence === "\x1B[H") {
            home();
        } else if (key.sequence === "\x1B[F") {
            end();
        } else if (key.sequence === "\t") {
            tab();
        } else if (key.sequence === "\f") {
            console.clear();
            refreshLine();
        } else if (!key.control && !key.meta) {
            historyPosition = 0;
            global.buf = buf.substring(0, cursor - ps1.length) + key.sequence + buf.substring(cursor - ps1.length);
            cursor++;
            refreshLine();
        }
    }

    process.stdin.addListener('keypress', inputHandler);
}