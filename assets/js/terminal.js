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

        this.history = {};
        this.history.cache = [];
        this.history.cursor = -1;
        this.history.temp = "";

        this.echo = true;

        this.mask = false;

        this.setMask(false);
    }
    pushHistory(command){
        if(!this.mask) {
            this.history.cache.push(command);
            this.history.cursor = this.history.cache.length;
            this.history.temp = "";
        }
    }
    checkHistoryCursor(){
        return (this.history.cursor == this.history.cache.length || this.history.cursor == -1);
    }
    getHistory(up){
        if(this.history.cache.length == 0) return;
        if(up) {
            this.history.cursor -= 1;
            if(this.history.cursor < 0) {
                this.history.cursor = this.history.cache.length;
            }
        } else {
            this.history.cursor += 1;
            if(this.history.cursor > this.history.cache.length){
                this.history.cursor = 0;
            }
        }
        return this.history.cache[this.history.cursor] || this.history.temp;
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
                    this.pushHistory(input);
                    if(this.echo && !this.mask) this.write(`${this.getPrompt()}${html.encode(input)}`);
                    this.setMask(false);
                    this.setPrompt(this.default_prompt);
                    this.oncommit(input);
                break;
                case keys.ESC:
                    // Clear input
                    this.history.cursor = this.history.cache.length;
                    this.input.val("");
                break;
                case keys.UP:
                    if(this.history.temp == "" || this.checkHistoryCursor()) this.history.temp = this.input.val();
                    let histup = this.getHistory(true);
                    if(histup != undefined) {
                        this.input.val("");
                        this.input.val(histup);
                        ev.preventDefault();
                    }
                break;
                case keys.DOWN:
                    if(this.history.temp == "" || this.checkHistoryCursor()) this.history.temp = this.input.val();
                    let histd = this.getHistory(false);
                    if(histd != undefined) {
                        this.input.val("");
                        this.input.val(histd);
                        ev.preventDefault();
                    }
                break;
                default:
                    if(this.input.val() == "") this.history.temp = "";
                break;
            }
        });
    }
    setPrompt(prompt){
        this.prompt.html(colorize(prompt));
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