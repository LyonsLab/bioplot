function translate(x, y) {
    return "translate(" + x + "," + y + ")";
}

function rotate(rotation) {
    return "rotate(" + rotation + ")";
}

function transform(x, y, rotation) {
    return translate(x,y) + rotate(rotation);
}
