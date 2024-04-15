const { app } = require('electron');
const spawnWindow = require(`./core/window`);

const config = require(`./core/config`);
const session = require(`./core/session`);

process.on('uncaughtException', ()=>{});

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required")

if(!app.isReady()) {
    app.once('ready', () => {
        global.window = spawnWindow(`./html/main.html`);
    });
} else {
    global.window = spawnWindow(`./html/main.html`);
}