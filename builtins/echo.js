const path = require('path');
const fs = require("fs");

module.exports = (parameters, output) => {
    output(parameters.join(" "));
}