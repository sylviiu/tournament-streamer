const { ipcMain } = require('electron');
const Stream = require(`./stream.js`);

const streams = {};

module.exports = (window) => {
    ipcMain.handle('start', (_e, { slot, streamID }) => {
        console.log('start', slot, streamID);
        if(streams[slot] && typeof streams[slot].stop == `function`) streams[slot].stop();
        streams[slot] = new Stream(streamID, slot);
        streams[slot].on(`data`, data => {
            window.webContents.send(`stream-${slot}`, new Uint8Array(data));
        });
        return streams[slot].url;
    })
}