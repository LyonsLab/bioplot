var slice = Array.prototype.slice,
    add = function(a, b) { return a + b; },
    mult = function(a, b) { return a * b; },
    sub = function(a, b) { return a  - b; },
    div = function(a, b) { return a / b; },
    even = function(a) { return a % 2 === 0; },
    odd = function(a) { return a % 2 === 1; },
    midpoint = function (x) { return (x[0] + x[1]) / 2; };

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

function bound(func, lower, upper, context) {
    return function() {
        var result = func.apply(context, arguments);
        if (isNaN(result)) return NaN;

        return Math.max(lower, Math.min(result, upper));
    };
}
