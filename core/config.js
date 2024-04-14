const fs = require(`fs`);
const recursiveAssign = require(`../util/recursiveAssign`)

const defaults = {
    rtmpServer: `http://localhost:1935/live`,
    streams: 6,
    width: 1920,
    height: 700,
    padding: 2,
    ffmpeg: {
        targetCodec: `h264`,
        additionalInputArgs: [],
        additionalOutputArgs: []
    },
};


const end = !fs.existsSync(`./config.json`)

if(end) {
    fs.writeFileSync(`./config.json`, JSON.stringify(defaults, null, 4));
    console.log(`No config file was found! A config.json template file has been created for you. Please fill in the values and start again!`);
    return process.exit(1);
}

let config = {};

try {
    config = require(`../config.json`);
} catch(e) { config = {} }

console.log(`config:`, config)

module.exports = recursiveAssign(defaults, config);

fs.writeFileSync(`./config.json`, JSON.stringify(module.exports, null, 4))