window.html = {
    encode: (input) => $("<textarea></textarea>").text(input).html(),
    decode: (input) => $("<textarea></textarea>").html(input).text()
}

function colorize(input){
    return input;
}