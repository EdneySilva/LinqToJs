function ComplexEqualitor(expression) {

    var expression = expression;
    var context = this;

    this.compare = function (a, b, properties) {
        for (var p = 0; p < properties.length; ++p) {
            var i = properties[p];
            if (typeof a[i] === "object" && !context.compare(a[i], b[i]))
                return false;
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }

    this.equals = function (a, b, expression) {
        var valueA = expression(a);
        var valueB = expression(b);
        if (typeof valueA === "object")
            return context.compare(valueA, valueB, Object.getOwnPropertyNames(valueA));
        return valueA === valueB;
    }

    return {
        equals: this.equals
    }
}

function SampleEqualitor() {

    this.equals = function (a, b, expression) {
        return expression(a) === expression(b);
    }

    return {
        equals: this.equals
    }
}

function ObjectEqualitor() {

    this.equals = function (a, b, expression) {
        return Object.hashCode(a) === Object.hashCode(b);
    }

    return {
        equals: this.equals
    }
}

String.prototype.hashCode = function () {
    var s = this;
    var h = 0, l = s.length, i = 0;
    if (l > 0)
        while (i < l)
            h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return h;
}

Object.hashCode = function (object) {

    var hash = function (value) {
        var hashValue = 0;
        var properties = Object.getOwnPropertyNames(value);
        for (var p = 0; p < properties.length; p++) {
            var i = properties[p];
            if (typeof value[i] === "function" || value[i] === null)
                continue;
            else if (typeof value[i] === "object")
                hashValue += Object.hashCode(value[i]);
            else
                hashValue += value[i].toString().hashCode();
        }
        return hashValue;
    }
    return hash(object);
}

Array.prototype.hashCode = function () {
    var hash = function (value) {
        var hashValue = 0;
        for (var i = 0; i < value.length; i++) {
            if (typeof value[i] === "function" || value[i] === null)
                continue;
            else if (typeof value[i] === "object")
                hashValue += Object.hashCode(value[i]);
            else
                hashValue += value[i].toString().hashCode();
        }
        return hashValue;
    }
    return hash(this);
}
