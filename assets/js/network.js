$(function(){
    let uri = window.location.hostname == 'game.mudjs.net' ? "wss://game.mudjs.net/ws" : "ws://localhost:45678";
    let ws = new WebSocket(uri);
    
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
                case 'keep-alive':
                    ws.send({request:"keep-alive"});
                break;
                case "print":
                    if (terminal) {
                        terminal.write(html.encode(dobj.payload));
                    }
                break;
                case 'prompt':
                    let inp = terminal.input.val().substring(terminal.prompt.length);
                    terminal.setPrompt(dobj.prompt);
                    terminal.setMask(Boolean(dobj.mask));
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