const readline = require('readline');
readline.emitKeypressEvents(process.stdin);

global.historyPosition = 0;

global.upKey = () => {
    if (buf.trim() !== "" && historyPosition === 0) return;
    let history = historyRead();

    if (global.historyPosition < history.length - 1) {
        global.historyPosition++;
        buf = history[global.historyPosition];
        cursor = ps1.length + buf.length;
        refreshLine();
    }
}

global.downKey = () => {
    if (buf.trim() !== "" && historyPosition === 0) return;
    let history = historyRead();

    if (global.historyPosition > 0) {
        global.historyPosition--;
        buf = history[global.historyPosition];
        cursor = ps1.length + buf.length;
        refreshLine();
    }
}

global.home = () => {
    cursor = ps1.length;
    refreshLine();
}

global.end = () => {
    cursor = ps1.length + buf.length;
    refreshLine();
}

global.leftKey = () => {
    if (cursor > ps1.length) {
        cursor--;
        refreshLine();
    }
}

global.rightKey = () => {
    if (cursor < buf.length + ps1.length) {
        cursor++;
        refreshLine();
    }
}

global.backspace = () => {
    if (buf.length > 0) {
        buf = buf.substring(0, cursor - ps1.length - 1) + buf.substring(cursor - ps1.length);
        cursor--;
        refreshLine();
    }
}

global.wordBackspace = () => {
    if (buf.length > 0) {
        let textBefore = buf.substring(0, cursor - ps1.length - 1);
        let wordSize = 0;

        for (let pos = cursor - ps1.length; pos > 0; pos--) {
            if (delimiters.includes(textBefore.charAt(pos))) {
                wordSize = (cursor - ps1.length) - pos - 1;
                break;
            }
        }

        if (wordSize > 0) {
            buf = buf.substring(0, cursor - ps1.length - wordSize) + buf.substring(cursor - ps1.length);
            cursor -= wordSize;
        } else {
            buf = "";
            cursor = ps1.length;
        }

        refreshLine();
    }
}

global.del = () => {
    buf = buf.substring(0, cursor - ps1.length) + buf.substring(cursor - ps1.length + 1);
    refreshLine();
}

global.leftWord = () => {
    let textBefore = buf.substring(0, cursor - ps1.length - 1);
    let updated = false;

    for (let pos = cursor - ps1.length; pos > 0; pos--) {
        if (delimiters.includes(textBefore.charAt(pos))) {
            cursor = pos + ps1.length + 1;
            updated = true;
            break;
        }
    }

    if (!updated) {
        cursor = ps1.length;
    }

    refreshLine();
}

global.rightWord = () => {
    let textAfter = buf.substring(cursor - ps1.length);
    let updated = false;

    for (let pos = 0; pos < textAfter.length; pos++) {
        if (delimiters.includes(textAfter.charAt(pos))) {
            cursor = pos + (cursor - ps1.length) + 3;
            updated = true;
            break;
        }
    }

    if (!updated) {
        cursor = ps1.length + buf.length;
    }

    refreshLine();
}

global.tab = () => {

}

global.nextKey = () => {
    return new Promise((res) => {
        process.stdin.once('keypress', (ch, key) => {
            res(key);
        });
    });
}