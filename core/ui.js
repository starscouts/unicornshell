const chalk = require('chalk');

global.error = (text) => {
    console.log(chalk.red("Error:") + " " + text);
}

global.warning = (text) => {
    console.log(chalk.yellow("Warning:") + " " + text);
}

global.refreshLine = (final) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if (ps1.length + buf.length >= process.stdout.columns) {
        if (buf.length >= process.stdout.columns) {
            let start = buf.length - (process.stdout.columns - 3);

            if ((cursor - ps1.length - Math.round(process.stdout.columns / 2)) - start > 1) {
                process.stdout.write(chalk.gray("…") + buf.substr(start, process.stdout.columns - 2));
                process.stdout.cursorTo((cursor - ps1.length + 1) - start);
            } else if (start === 0) {
                process.stdout.write(" " + buf.substr(start, process.stdout.columns - 3) + chalk.gray("…"));
                process.stdout.cursorTo((cursor - ps1.length + 1) - start);
            } else {
                while ((cursor - ps1.length - Math.round(process.stdout.columns / 2)) - start <= 1 && start > 0) {
                    start--;
                }

                if (start === 0) {
                    process.stdout.write(" " + buf.substr(start, process.stdout.columns - 3) + chalk.gray("…"));
                    process.stdout.cursorTo((cursor - ps1.length + 1) - start);
                } else {
                    process.stdout.write(chalk.gray("…") + buf.substr(start, process.stdout.columns - 3) + chalk.gray("…"));
                    process.stdout.cursorTo((cursor - ps1.length + 1) - start);
                }
            }
        } else {
            process.stdout.write(chalk.gray("…") + buf);
            process.stdout.cursorTo(cursor - ps1.length + 1);
        }
    } else {
        process.stdout.write(ps1color + buf);
        process.stdout.cursorTo(cursor);
    }
}