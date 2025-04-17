const path = require('path');
const fs = require("fs");

module.exports = (parameters, output) => {
    if (parameters[0]) {
        if (parameters[0].trim().replace(/^[a-zA-Z\d_]+$/gm, "") !== "") {
            error("Variable names can only contain alphanumeric characters and underscores.");
        } else {
            delete global.env[parameters[0]];
        }
    } else {
        error("Cannot unset all variables.");
    }
}