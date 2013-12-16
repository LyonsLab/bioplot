var slice = Array.prototype.slice;

function translate(x, y) {
    return "translate(" + x + "," + y + ")";
}

function rotate(rotation) {
    return "rotate(" + rotation + ")";
}

function transform(x, y, rotation) {
    return translate(x,y) + rotate(rotation);
}

function pick(attribute) {
    return function(object) {
        return object[attribute];
    };
}

function scan(func, initial, iterable) {
    var reduce = function(value, index, list) {
        return list.slice(0, index + 1).reduce(func);
    };

    return [].concat([initial], iterable).map(reduce);
}

function rbind(func, object) {
    var args = _.rest(arguments, 2);

    return function() {
        return func.apply(object, [].concat(_.toArray(arguments), args));
    };
}
