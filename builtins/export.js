const path = require('path');
const fs = require("fs");

module.exports = (parameters, output) => {
    if (parameters[0]) {
        if (parameters[0].trim().replace(/^[a-zA-Z\d_]+$/gm, "") !== "") {
            error("Variable names can only contain alphanumeric characters and underscores.");
        } else {
            global.env[parameters[0]] = parameters[1];
        }
    } else {
        for (let name of Object.keys(global.env)) {
            output(name + "=" + global.env[name]);
        }
    }
}