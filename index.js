const { app, ipcMain } = require('electron');
const spawnWindow = require(`./core/window`);

const config = require(`./core/config`);
const session = require(`./core/session`);

process.on('uncaughtException', ()=>{});

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required")

const spawnWindows = () => {
    const start = Date.now();
    global.window = spawnWindow(`./html/main.html`);
    ipcMain.once(`mainReady`, () => {
        console.log(`main ready -- took ${Date.now() - start}ms`);
        global.controller = spawnWindow(`./html/control.html`, {
            width: 400,
            minWidth: 400,
            maxWidth: 400,
            height: 800,
            minHeight: 800,
            maxHeight: 800,
            resizable: false,
            frame: true,
            transparent: false
        });
    })
}

if(!app.isReady()) {
    app.once('ready', spawnWindows);
} else {
    spawnWindows();
}