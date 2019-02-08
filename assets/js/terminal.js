class Terminal {
    constructor(selector = "body", opts = {}) {
        this.output = $(selector);
        opts = Object.assign(opts, {
            prompt: "$ ",
        });
        this.inputline = $(`<div id="inputline"></div>`);
        this.input = {focus:()=>{}, remove:()=>{}}; // noop
        this.prompt = $(`<div id="input-prompt" class="terminal">${opts.prompt}</div>`);
        this.inputline.append(this.prompt);
        this.output.parent().append(this.inputline);
        $(document).click(()=>{
            this.input.focus();
        });
        this.default_prompt = opts.prompt;

        this.oncommit = opts.oncommit || function(){};

        this.echo = true;

        this.mask = false;

        this.setMask(false);
    }
    getPrompt(){
        return this.prompt.html();
    }
    setMask(mask = false){
        this.mask = mask;
        if(this.mask){
            this.input.remove();
            this.input = $(`<input autocomplete="nope" type="password" id="terminal-input" class="terminal">`);
            this.inputline.append(this.input);
            this.input.focus();
        } else {
            this.input.remove();
            this.input = $(`<input autocomplete="nope" type="text" id="terminal-input" class="terminal">`);
            this.inputline.append(this.input);
            this.input.focus();
        }
        const keys = {
            ENTER: 13,
            ESC: 27,
            BACKSPACE: 8,
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39
        }
        this.input.keydown((ev) => {
            switch(ev.keyCode){
                case keys.ENTER:
                    // Commit text
                    let input = this.input.val();
                    this.input.val(this.default_prompt);
                    if(this.echo && !this.mask) this.write(`${this.getPrompt()}${html.encode(input)}`);
                    this.setMask(false);
                    this.setPrompt(this.default_prompt);
                    this.oncommit(input);
                break;
                case keys.ESC:
                    // Clear input
                    this.input.val("");
                break;
            }
        });
    }
    setPrompt(prompt){
        this.prompt.html(prompt);
    }
    write(...args){
        args = colorize(args.join(" "));
        let old = this.output.html();
        this.output.html(`${old}${args}\n`);
    }
    clear(){
        this.output.html("");
    }
}

$(function(){
    let terminal = new Terminal("#terminal-output", {
        oncommit: function(input){
            let splits = input.split(" ");
            let cmd = splits[0];
            let args = splits.slice(1);
            switch(cmd){
                case "now":
                    terminal.write(Date.now());
                break;
                default:
                    if(ws && ws.readyState == 1) {
                        ws.send({
                            request: "command",
                            command: input
                        });
                    }
                break;
            }
        }
    });
    terminal.write("MUD.rs Client Demo r.001");
    window.terminal = terminal;
});