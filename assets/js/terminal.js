class Terminal {
    constructor(selector = "body", opts = {}) {
        this.output = $(selector);
        opts = Object.assign(opts, {
            prompt: "$ ",
        });
        this.input = $(`<input type="text" id="terminal-input" class="terminal">`);
        this.output.parent().append(this.input);
        $(document).click(()=>{
            this.input.focus();
        });
        this.prompt = opts.prompt;
        this.default_prompt = this.prompt;

        this.oncommit = opts.oncommit || function(){};

        const keys = {
            ENTER: 13,
            ESC: 27,
            BACKSPACE: 8,
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39
        }

        this.buffer = "";

        this.echo = true;

        this.mask = false;

        this.input.keydown((ev) => {
            switch(ev.keyCode){
                case keys.ENTER:
                    // Commit text
                    let input = this.mask ? this.buffer : this.input.val().substring(this.prompt.length);
                    this.buffer = "";
                    this.input.val(this.default_prompt);
                    if(this.echo && !this.mask) this.write(`${this.prompt}${html.encode(input)}`);
                    this.mask = false;
                    this.prompt = this.default_prompt;
                    this.oncommit(input);
                break;
                case keys.ESC:
                    // Clear input
                    this.input.val(this.prompt);
                    this.buffer = "";
                break;
                case keys.BACKSPACE:
                    if(this.buffer.length > 0) this.buffer = this.buffer.substring(0, this.buffer.length-1);
                    if(this.input.val().length == this.prompt.length) ev.preventDefault();
                break;
                case keys.UP:
                case keys.DOWN:
                case keys.LEFT:
                case keys.RIGHT:
                    ev.preventDefault();
                break;
            }
        });

        this.input.keyup((ev)=>{
            if(this.mask){
                let input = this.input.val();
                this.input.val(this.prompt);
                this.buffer += input.substring(this.prompt.length);
                ev.preventDefault();
            }
        });
        this.input.val(this.prompt);
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