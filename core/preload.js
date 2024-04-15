const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('conf', require(`../config.json`));
contextBridge.exposeInMainWorld('session', require(`./session.js`));

contextBridge.exposeInMainWorld('ipc', {
    handleStreamStates: (cb) => {
        ipcRenderer.on(`streamStates`, () => ipcRenderer.send(`streamStates`, cb()));
        ipcRenderer.send(`mainReady`);
    },
    getStreamStates: () => ipcRenderer.invoke(`getStreamStates`),
    startStream: (data) => ipcRenderer.invoke('stream', data),
    start: (slot, cb) => ipcRenderer.on(`start-${slot}`, (_e, d) => cb(d)),
    stream: (slot, cb) => ipcRenderer.on(`stream-${slot}`, (_e, d) => cb(d)),
    restart: (slot, cb) => ipcRenderer.on(`restart-${slot}`, (_e, d) => cb(d)),
    mute: (slot, cb) => ipcRenderer.on(`mute-${slot}`, (_e, d) => cb(d)),
    sendRestart: (slot) => ipcRenderer.invoke('restart', slot),
    sendMute: (slot, value) => ipcRenderer.invoke(`mute`, { slot, value }),
    sendStart: (slot, streamID) => ipcRenderer.invoke(`start`, { slot, streamID })
});

const addScript = (path, type) => new Promise(async (res, rej) => {
    const name = path;

    const script = document.createElement(`script`);

    if(type == `lib`) {
        let usePath = null;
        const checkDir = (p) => {
            if(p) {
                const dir = fs.readdirSync(p);
                if(dir.find(s => s.endsWith(`min.js`))) usePath = require(`path`).join(p, dir.find(s => s.endsWith(`min.js`)))
            }
        };

        const checkDirs = [`lib`, `src`, `dist`]

        for (const dir of checkDirs) {
            const thisPath = await getPath(`node_modules/${path}/${dir}`);
            checkDir(thisPath);
            if(usePath) break;
        }

        path = usePath;
    }

    console.log(`${name} - path: ${path}`)

    if(!path) return null;

    script.setAttribute(`src`, path);
    script.setAttribute(`async`, false);

    document.head.appendChild(script);

    script.addEventListener(`load`, () => {
        //console.log(`loaded script ${path}`)
        res()
    });

    script.addEventListener(`error`, (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        //console.log(`failed to load script ${path}`)
        rej(e)
    });
})

addEventListener(`DOMContentLoaded`, async () => {
    const scriptToAdd = (window.location.href.split(`/`).slice(-1)[0].split(`.`).slice(0, -1).join(`.`) + `.js`);
    await addScript(`./js/${scriptToAdd}`)

    console.log(`loaded ${scriptToAdd}`)
});