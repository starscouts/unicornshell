global.version = "0.3";

const yargs = require('yargs/yargs')()
    .scriptName(process.argv0)
    .usage('$0 [<options>] [<script>] [<argument> ...]')
    .version(false)
    .options({
        'version': {
            alias: 'v',
            type: 'boolean',
            description: 'Shows version number'
        },
        'safe': {
            alias: 's',
            type: 'boolean',
            description: 'Disables loading ~/.unish/profile.unish'
        }
    })
    .help();

yargs.parse(process.argv, function yargsCallback(err, args, output) {
    if (output) {
        output = output.replace(/\[\w+]/g, '');
        console.log(output);
        return;
    }

    if (args.version) {
        console.log("unish " + version);
    } else {
        if (args.safe) {
            global.safeMode = true;
        } else {
            global.safeMode = false;
        }

        if (args["_"][2]) {
            global.scriptMode = true;
            global.scriptName = args["_"][2];
            require('./core/script');
        } else {
            global.scriptMode = false;
            require('./core/shell');
        }
    }
});