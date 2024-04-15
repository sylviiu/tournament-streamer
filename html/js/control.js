console.log(session)

const labeledInput = (name, type, value={}, onclick=()=>{}) => {
    const div = document.createElement('div');
    div.style.display = `flex`;
    div.style.flexDirection = `row`;
    div.style.alignItems = `center`;

    const input = document.createElement(type);
    for(const [ key, val ] of Object.entries(value)) { input[key] = val }
    input.onclick = (...d) => onclick(input, ...d);
    div.appendChild(input);

    const label = document.createElement('h5');
    label.innerText = name
    div.appendChild(label);

    return div;
};

console.log(`getting stream states`, session.streams);

let streams = [];

ipc.getStreamStates().then(mainStreams => {
    //setInterval(() => ipc.getStreamStates().then(s => mainStreams = s), 1000);

    streams = session.streams.map((stream, i) => {
        const mainStream = mainStreams[i];
    
        const div = document.createElement('div');
        div.style.width = `100%`;
        div.style.maxWidth = `calc(100vw - 50px)`;
        div.style.overflow = `hidden`;
        div.style.padding = `25px 10px`;
        div.style.display = `flex`;
        div.style.flexDirection = `column`;
    
        const streamKey = document.createElement('input');
        streamKey.type = `text`;
        streamKey.placeholder = `stream key`;
        if(mainStream.streamID) streamKey.value = mainStream.streamID;
        div.appendChild(streamKey);
    
        const streamName = document.createElement('input');
        streamName.type = `text`;
        streamName.placeholder = `username`;
        div.appendChild(streamName);
    
        const applyButton = document.createElement('button');
        applyButton.innerText = `Apply`;
        applyButton.style.marginBottom = `10px`;
        applyButton.onclick = () => {
            console.log(`applying ${streamKey.value} to ${stream.stream}`);
            ipc.sendStart(stream.stream, streamKey.value);
        };
        div.appendChild(applyButton);
    
        const muteDiv = labeledInput(`Muted`, `input`, { type: `checkbox`, checked: true }, (inp) => {
            ipc.sendMute(stream.stream, inp.checked);
        });
    
        const reload = labeledInput(`HEEEEELP`, `button`, { textContent: `Reload Stream` }, () => {
            console.log(`restarting ${stream.stream}`);
            applyButton.onclick();
        });
    
        div.appendChild(muteDiv);
        div.appendChild(reload);
    
        document.body.appendChild(div);
    })
})