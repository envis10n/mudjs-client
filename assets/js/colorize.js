window.html = {
    encode: (input)=>$("<textarea></textarea>").text(input).html(),
    decode: (input)=>$("<textarea></textarea>").html(input).text()
}

let ansi = {
    "\x1b[30m": '<span style="color: #000;">', //black
    "\x1b[31m": '<span style="color: #800000;">', //red
    "\x1b[32m": '<span style="color: #008000;">', //green
    "\x1b[33m": '<span style="color: #808000;">', //yellow
    "\x1b[34m": '<span style="color: #000080;">', //blue
    "\x1b[35m": '<span style="color: #800080;">', //magenta
    "\x1b[36m": '<span style="color: #008080;">', //cyan
    "\x1b[37m": '<span style="color: #c0c0c0;">', //white
    "\x1b[90m": '<span style="color: #555555;">',
    "\x1b[91m": '<span style="color: #FF5555;">',
    "\x1b[92m": '<span style="color: #55FF55;">',
    "\x1b[93m": '<span style="color: #FFFF55;">',
    "\x1b[94m": '<span style="color: #5555FF;">',
    "\x1b[95m": '<span style="color: #ff55ff;">',
    "\x1b[96m": '<span style="color: #55FFFF;">',
    "\x1b[97m": '<span style="color: #fff;">',
    "\x1b[0m": '<span style="color: #fff;">',
    "\x1b[39m": '<span style="color: #fff;">',
}

function colorize(input){
    input = html.encode(input);
    let reg = new RegExp(/(\x1b\[\d?\;?\d\d?m)/g);
    let count = 0;
    let match = reg.exec(input);
    while(match) {
        let color = ansi[match[1]];
        if(!color) {
            console.log(`Did not match: ${match[1]}`);
            match = reg.exec(input);
        } else {
            count += 1;
            input = input.replace(match[1], color);
            match = reg.exec(input);
        }
    }
    return input+'</span>'.repeat(count);
}