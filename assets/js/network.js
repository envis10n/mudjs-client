$(function(){
    let ws = new WebSocket("ws://localhost:45678");
    
    ws._send = ws.send;
    
    ws.send = (obj) => {
        ws._send(JSON.stringify(Object.assign(obj, {ts: Date.now()})));
    }
    
    ws.onopen = (ev) => {
        terminal.write("Connection established.");
    };
    
    ws.onmessage = (ev) => {
        let data = ev.data;
        try {
            let dobj = JSON.parse(data);
            switch(dobj.event) {
                case "print":
                    if (terminal) {
                        terminal.write(dobj.payload);
                    }
                break;
                case 'prompt':
                    let inp = terminal.input.val().substring(terminal.prompt.length);
                    terminal.prompt = dobj.prompt;
                    terminal.mask = Boolean(dobj.mask);
                    if(terminal.mask) {
                        terminal.buffer = inp;
                        inp = "";
                    }
                    terminal.input.val(`${terminal.prompt}${inp}`);
                break;
            }
        } catch(e) {
            console.log(`Could not parse message from server: ${data}`);
        }
    };
    
    ws.onerror = () => {
        terminal.write("WS ERROR.");
    }
    
    ws.onclose = () => {
        terminal.write("WS Connection Lost.");
    }
    
    window.ws = ws;
});