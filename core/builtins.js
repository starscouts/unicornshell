module.exports = {
    cd: require('../builtins/cd'),
    export: require('../builtins/export'),
    version: require('../builtins/version'),
    abort: require('../builtins/abort'),
    echo: require('../builtins/echo'),
    unset: require('../builtins/unset')
}

global.parametersToAdd = {
    ls: ["-G", "--color=auto"]
}