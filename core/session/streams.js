const { streams, width, height, padding } = require(`../config`);

const usePadding = padding % 2 === 0 ? padding : (padding + 1)

const arr = [];

const layers = streams > 3 ? 2 : 1;
const streamHeight = (height / layers) - (layers < 2 ? 0 : (usePadding/2));

const topLayerStreams = Math.floor(streams / layers);
const topLayerStreamWidth = ((width - (usePadding / 2)) / topLayerStreams);

const bottomLayerStreams = streams - topLayerStreams;
const bottomLayerStreamWidth = ((width - (usePadding / 2)) / bottomLayerStreams);

for(let i = 0; i < streams; i++) {
    const stream = i+1
    if(stream <= topLayerStreams) {
        // top layer stream
        const xOffset = i > 0 ? (i * (topLayerStreamWidth + usePadding)) : 0;
        arr.push({
            stream,
            xOffset,
            yOffset: 0,
            width: topLayerStreamWidth,
            height: streamHeight
        });
    } else {
        // bottom layer stream
        const s = (i - topLayerStreams);
        const xOffset = s > 0 ? s * (bottomLayerStreamWidth + usePadding) : 0;
        arr.push({
            stream,
            xOffset,
            yOffset: streamHeight + usePadding,
            width: bottomLayerStreamWidth,
            height: streamHeight
        });
    }
}

console.log(`streams: ${streams} -- padding: ${usePadding} (conf: ${padding}) -- layers: ${layers}\n| streamHeight: ${streamHeight}`, arr);

module.exports = arr;