const { BrowserWindow, app } = require('electron');
const config = require(`./config.js`);
const ipc = require('./ipc');

module.exports = (toLoad, obj={}) => {
    const args = require(`../util/recursiveAssign`)({
        width: config.width,
        minWidth: config.width,
        maxWidth: config.width,
        height: config.height,
        minHeight: config.height,
        maxHeight: config.height,
        resizable: false,
        frame: false,
        transparent: true,
        autoHideMenuBar: true,
        fullscreenable: false,
        backgroundColor: `rgb(10,10,10)`,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: true,
            contextIsolation: true,
            devTools: true,
            sandbox: false,
            backgroundThrottling: false,
            preload: require(`path`).join(__dirname, 'preload.js')
        }
    }, obj);

    console.log(`window args:`, args);

    const window = new BrowserWindow(args);

    if(toLoad) window.loadFile(toLoad);

    ipc(window);

    return window;
}