const chalk = require('chalk');
const readline = require('readline');

readline.emitKeypressEvents(process.stdin);

function nextKey() {
    return new Promise((res) => {
        process.stdin.once('keypress', (ch, key) => {
            res(key);
        });
    });
}

async function prompt() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    while (true) {
        let key = await nextKey();
        console.log(key);

        if (key.sequence === "\x03") {
            process.stdout.write("\n");
            process.exit();
        }
    }
}

prompt();