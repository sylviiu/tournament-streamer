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
            `-probesize`, `32`,
            `-analyzeduration`, `0`,
            `-re`,
            `-i`, this.url,
            `-vf`, `format=yuv420p, scale=(iw*sar)*max(${this.width}/(iw*sar)\\,${this.height}/ih):ih*max(${this.width}/(iw*sar)\\,${this.height}/ih), crop=${this.width}:${this.height}`,
            `-c:v`, `libvpx`,
            `-cpu-used`, `5`,
            `-deadline`, `realtime`,
            `-b:v`, `30000k`,
            `-quality`, `realtime`,
            `-r`, `60`,
            `-c:a`, `libvorbis`,
            `-f`, `webm`,
            `-`
        ];

        console.log(this.args)
        this.proc = child_process.execFile(ffmpeg, this.args, {
            maxBuffer: 1024 * 1024 * 1024, // 1GB
            encoding: 'buffer'
        });

        let started = false;

        const errListener = data => {
            if(!started) console.log(data.toString(`utf-8`).trim());
        };

        this.proc.stdout.on(`data`, data => {
            bytes += Buffer.byteLength(data);
            this.emit(`data`, data);
            started = true;
            this.proc.stderr.removeListener(`data`, errListener);
        });

        this.proc.stderr.on(`data`, errListener);
    }

    stop() {
        if(this.proc) {
            this.proc.kill(`SIGINT`);
            return true;
        } else return false;
    }
}

module.exports = Stream;