const fs = require('fs');

global.historyWrite = (str) => {
    try {
        let current = historyRead();
        if (current[1] === str) return true;

        fs.appendFileSync(process.env.HOME + "/.unish/history.txt", "\n" + str);
        return true;
    } catch (e) {
        return false;
    }
}

global.historyRead = () => {
    try {
        return ["", ...fs.readFileSync(process.env.HOME + "/.unish/history.txt").toString().trim().split("\n").reverse()];
    } catch (e) {
        return [""];
    }
}