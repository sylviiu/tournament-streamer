const { ipcMain } = require('electron');
const Stream = require(`./stream.js`);

const streams = {};

module.exports = (window) => {
    ipcMain.handle('stream', (_e, { slot, streamID }) => {
        console.log('stream', slot, streamID);
        if(streams[slot] && typeof streams[slot].stop == `function`) streams[slot].stop();
        streams[slot] = new Stream(streamID, slot);
        streams[slot].on(`data`, data => {
            window.webContents.send(`stream-${slot}`, new Uint8Array(data));
        });
        return streams[slot].url;
    });

    ipcMain.handle('start', (_e, { slot, streamID }) => {
        console.log('remote start', slot);
        window.webContents.send(`start-${slot}`, streamID);
        return true;
    });

    ipcMain.handle('restart', (_e, slot) => {
        console.log('restart', slot);
        if(streams[slot] && typeof streams[slot].stop == `function`) streams[slot].stop();
        window.webContents.send(`restart-${slot}`);
        return true;
    });

    ipcMain.handle('mute', (_e, { slot, value }) => {
        console.log('mute', slot, value);
        window.webContents.send(`mute-${slot}`, value);
        return true;
    });

    ipcMain.handle('getStreamStates', async (_e) => {
        global.window.webContents.send(`streamStates`);
        return await new Promise(async res => ipcMain.once(`streamStates`, (_e, d) => res(d)))
    });

    window.on(`close`, () => {
        console.log(`closed`)
        app.exit();
    });
}