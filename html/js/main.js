
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

    const initialize = () => {
        while(div.querySelector(`video`)) div.removeChild(div.querySelector(`video`));
        
        div.style.backgroundColor = `black`;

        video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.style.width = `${stream.width}px`;
        video.style.height = `${stream.height}px`;
        video.style.overflow = `hidden`;
        div.appendChild(video);

        if (!mediaSource) {
            mediaSource = new MediaSource();
            video.src = URL.createObjectURL(mediaSource);
            mediaSource.addEventListener('sourceopen', () => {
                sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8, vorbis"');
            });
        }
    };

    ipc.stream(stream.stream, data => {
        if (sourceBuffer && !sourceBuffer.updating) {
            //console.log(`Data for stream ${stream.stream}: appending`);
            sourceBuffer.appendBuffer(data);
        } else {
            console.log(`Data for stream ${stream.stream}: NOT appending`);
        }
    });

    console.log(`Created stream div for stream #${stream.stream}`);
    body.appendChild(div);

    return {
        stream,
        play: (streamID) => {
            initialize();
            ipc.start({ streamID, slot: `${stream.stream}` });
        },
        div
    };
});