const child_process = require('child_process');
const ffmpeg = require('ffmpeg-static');
const config = require(`./config`);
const session = require('./session');
const EventEmitter = require('events').EventEmitter;

let bytes = 0;

setInterval(() => {
    if(bytes > 0) {
        console.log(`raw data in MB: ${bytes/1e+6}`);
        bytes = 0;
    }
}, 2000);

class Stream extends EventEmitter {
    constructor(name, slot) {
        super();
        this.slotNum = slot;
        this.streamID = name;
        this.slot = session.streams.find(o => o.stream == slot);
        this.width = Math.ceil(this.slot.width);
        this.height = Math.ceil(this.slot.height);
        this.url = (config.rtmpServer + '/' + name)//.replace(/\/\//g, '/');
        console.log(this.url);
        this.start();
    }

    start() {
        this.stop();

        this.args = [
            ...(config.hwaccel ? [`-hwaccel`, config.hwaccel] : []),
            `-probesize`, `32`,
            `-analyzeduration`, `0`,
            `-re`,
            `-i`, this.url,
            `-vf`, `format=yuv420p, scale=(iw*sar)*max(${this.width}/(iw*sar)\\,${this.height}/ih):ih*max(${this.width}/(iw*sar)\\,${this.height}/ih), crop=${this.width}:${this.height}`,
            `-c:v`, `libvpx-vp9`,
            `-cpu-used`, `8`,
            `-deadline`, `realtime`,
            `-quality`, `realtime`,
            `-b:v`, `4000k`,
            `-minrate`, `3000k`,
            `-maxrate`, `8000k`,
            `-threads`, `1`,
            `-r`, `${config.fps}`,
            `-c:a`, `libvorbis`,
            `-f`, `webm`,
            `-`
        ];

        const errLogger = data => {
            console.log(`[${this.slotNum}] ` + data.toString(`utf-8`).trim());
        };

        console.log(this.args)
        this.proc = child_process.execFile(ffmpeg, this.args, {
            maxBuffer: 1024 * 1024 * 1024, // 1GB
            encoding: 'buffer'
        });

        this.proc.stderr.on(`data`, errLogger)

        this.proc.stdout.on(`data`, data => {
            bytes += Buffer.byteLength(data);
            this.emit(`data`, data);
            this.proc.stderr.removeListener(`data`, errLogger)
            started = true;
        });
    }

    stop() {
        if(this.proc) {
            this.proc.kill(`SIGINT`);
            return true;
        } else return false;
    }
}

module.exports = Stream;