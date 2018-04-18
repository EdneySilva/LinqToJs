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
        return a.hashCode() === b.hashCode();
    }

    return {
        equals: this.equals
    }
}
