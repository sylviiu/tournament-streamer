const { app } = require('electron');
const spawnWindow = require(`./core/window`);

const config = require(`./core/config`);
const session = require(`./core/session`);

if(!app.isReady()) {
    app.once('ready', () => {
        global.window = spawnWindow(`./html/main.html`, true);
    });
} else {
    global.window = spawnWindow(`./html/main.html`, true);
}