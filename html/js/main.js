document.body.style.width = conf.width;
document.body.style.minWidth = conf.width;
document.body.style.maxWidth = conf.width;

document.body.style.height = conf.height;
document.body.style.minHeight = conf.height;
document.body.style.maxHeight = conf.height;

document.body.style.overflow = `hidden`;

console.log(session)

const streams = session.streams.map(stream => {
    const div = document.createElement('div');
    div.style.backgroundColor = 'white';
    div.style.width = stream.width;
    div.style.height = stream.height;
    div.style.overflow = `hidden`;
    div.style.position = `absolute`;
    div.style.left = `${stream.xOffset}px`;
    div.style.top = `${stream.yOffset}px`;

    let video;
    let mediaSource;
    let sourceBuffer;
    let sourceBufferQueue = [];
    let sourceBufferResolveQueue = [];
    let appending = false;

    const appendBuffer = async (buf) => {
        sourceBufferQueue.push(buf);

        if(!appending) {
            appending = true;
            
            while(sourceBufferQueue.length) {
                const buf = sourceBufferQueue.shift();
                await new Promise(async res => {
                    sourceBufferResolveQueue.push(res);
                    sourceBuffer.appendBuffer(buf);
                })
            };

            appending = false;
        } else {
            console.log(`[${stream.stream}] already appending a buffer, just adding to queue!`)
        }
    }

    const initialize = () => new Promise(async res => {
        sourceBufferQueue = [];

        if(sourceBuffer && sourceBufferResolveQueue.length || appending) {
            await new Promise(async r => sourceBufferResolveQueue.push(r));
            sourceBuffer.remove();
        };

        sourceBuffer = null;

        while(div.querySelector(`video`)) div.removeChild(div.querySelector(`video`));
        
        div.style.backgroundColor = `black`;

        video = document.createElement('video');
        video.autoplay = true;
        if(obj.muted) video.muted = true;
        video.style.width = `${stream.width}px`;
        video.style.height = `${stream.height}px`;
        video.style.overflow = `hidden`;
        div.appendChild(video);

        mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', () => {
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9, vorbis"');
            sourceBuffer.addEventListener('update', () => {
                while(sourceBufferResolveQueue.length) {
                    const res = sourceBufferResolveQueue.shift();
                    res();
                };
            })
        });

        res();
    });

    ipc.restart(stream.stream, () => {
        console.log(`[${stream.stream}] Restarting`);
        //obj.play(obj.streamID);
        initialize()
    });

    ipc.start(stream.stream, streamID => {
        console.log(`[${stream.stream}] Starting new stream: ${streamID}`);
        obj.play(streamID);
    });

    ipc.mute(stream.stream, (val) => {
        if(val) {
            console.log(`[${stream.stream}] Muting (${val}) @ ${obj.streamID}`);
            obj.muted = true;
            video.muted = true;
        } else {
            console.log(`[${stream.stream}] Unmuting (${val}) @ ${obj.streamID}`);
            obj.muted = false;
            video.muted = false;
        }
    });

    ipc.stream(stream.stream, data => {
        if(sourceBuffer && !sourceBuffer.updating) {
            try {
                appendBuffer(data);
            } catch(e) {
                initialize();
            }
        };
    });

    console.log(`Created stream div for stream #${stream.stream}`);
    document.body.appendChild(div);

    const obj = {
        muted: true,
        stream,
        get mediaSource() {
            return mediaSource;
        },
        get sourceBuffer() {
            return sourceBuffer;
        },
        get video() {
            return video;
        },
        initialize: () => initialize(),
        play: (streamID) => {
            initialize();
            obj.streamID = streamID;
            ipc.startStream({ streamID, slot: `${stream.stream}` });
        },
        streamID: null,
        div
    };

    return obj;
});

console.log(`ready to handle states`)

ipc.handleStreamStates(() => JSON.parse(JSON.stringify(streams)));