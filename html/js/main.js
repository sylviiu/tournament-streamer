
const body = document.firstChild.lastChild

body.style.width = conf.width;
body.style.minWidth = conf.width;
body.style.maxWidth = conf.width;

body.style.height = conf.height;
body.style.minHeight = conf.height;
body.style.maxHeight = conf.height;

body.style.overflow = `hidden`;

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

        if(sourceBufferResolveQueue.length || appending) await new Promise(async r => sourceBufferResolveQueue.push(r));
        sourceBuffer = null;

        while(div.querySelector(`video`)) div.removeChild(div.querySelector(`video`));
        
        div.style.backgroundColor = `black`;

        video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
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

    ipc.stream(stream.stream, data => {
        if (sourceBuffer && !sourceBuffer.updating) {
            try {
                appendBuffer(data);
            } catch(e) {
                initialize();
            }
        } else {
            console.log(`Data for stream ${stream.stream}: NOT appending`);
        }
    });

    console.log(`Created stream div for stream #${stream.stream}`);
    body.appendChild(div);

    const obj = {
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
            ipc.start({ streamID, slot: `${stream.stream}` });
        },
        streamID: null,
        div
    };

    return obj;
});