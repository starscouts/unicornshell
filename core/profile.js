const fs = require('fs');
const os = require('os');

module.exports = async () => {
    if (!global.safeMode) {
        if (fs.existsSync(os.homedir() + "/.unish") && fs.existsSync(os.homedir() + "/.unish/profile.unish")) {
            let lines;

            try {
                lines = fs.readFileSync(os.homedir() + "/.unish/profile.unish").toString().split("\n").map(i => i.trim()).filter(i => i.trim() !== "");
            } catch (e) {
                error("Failed to read " + os.homedir() + "/.unish/profile.unish");
                return;
            }

            for (let line of lines) {
                await processLine(line, false);
            }
        }
    }
}