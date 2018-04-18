(function (window) {

    String.prototype.hashCode = function () {
        var s = this;
        var h = 0, l = s.length, i = 0;
        if (l > 0)
            while (i < l)
                h = (h << 5) - h + s.charCodeAt(i++) | 0;
        return h;
    }

    Object.prototype.hashCode = function () {

        var hash = function (value) {
            var hashValue = 0;
            var properties = Object.getOwnPropertyNames(value);
            for (var p = 0; p < properties.length; p++) {
                var i = properties[p];
                if (typeof value[i] === "function" || value[i] === null)
                    continue;
                else if (typeof value[i] === "object")
                    hashValue += value[i].hashCode(value[i]);
                else
                    hashValue += value[i].toString().hashCode();
            }
            return hashValue;
        }
        return hash(this);
    }

    Array.prototype.hashCode = function () {
        var hash = function (value) {
            var hashValue = 0;
            for (var i = 0; i < value.length; i++) {
                if (typeof value[i] === "function" || value[i] === null)
                    continue;
                else if (typeof value[i] === "object")
                    hashValue += value[i].hashCode(value[i]);
                else
                    hashValue += value[i].toString().hashCode();
            }
            return hashValue;
        }
        return hash(this);
    }

    var oldJoin = Array.prototype.join;

    Array.prototype.asQueryable = function () {
        return new Queryable(this);
    }
    Array.prototype.aggregate = function (type, expression) {
        return this.asQueryable().aggregate(type, expression);
    },
    Array.prototype.all = function (expression) {
            return this.asQueryable().all(expression);
        }
    Array.prototype.any = function (expression) {
        return this.asQueryable().any(expression);
    }
    Array.prototype.count = function (expression) {
        return this.asQueryable().count(expression);
    }
    Array.prototype.distinct = function (expression) {
        return this.asQueryable().distinct(expression);
    }
    Array.prototype.first = function (expression) {
        return this.asQueryable().first(expression);
    }
    Array.prototype.groupBy = function (expression) {
        return this.asQueryable().groupBy(expression);
    }
    Array.prototype.join = function (inner, outerKeySelector, innerKeySelector, resultSelector) {
        function allIsFunction(args) {
            for (var i = 1; i < args.length; i++) {
                if (typeof args[i] !== "function")
                    return false;
            }
            return true;
        }
        if (Array.isArray(arguments[0]) && allIsFunction(arguments))
            return this.asQueryable().join(inner, outerKeySelector, innerKeySelector, resultSelector);
        return oldJoin.apply(this, arguments);
    }
    Array.prototype.last = function (expression) {
        return this.asQueryable().last(expression);
    }
    Array.prototype.orderBy = function (expression) {
        return this.asQueryable().orderBy(expression);
    }
    Array.prototype.orderByDesc = function (expression) {
        return this.asQueryable().orderByDesc(expression);
    }
    Array.prototype.select = function (expression) {
        return this.asQueryable().select(expression);
    }
    Array.prototype.selectMany = function (expression) {
        return this.asQueryable().selectMany(expression);
    }
    Array.prototype.skip = function (expression) {
        return this.asQueryable().skip(expression);
    }
    Array.prototype.sum = function (expression) {
        return this.asQueryable().sum(expression);
    }
    Array.prototype.take = function (expression) {
        return this.asQueryable().take(expression);
    }
    Array.prototype.union = function (expression) {
        return this.asQueryable().union(expression);
    }
    Array.prototype.where = function (expression) {
        return this.asQueryable().where(expression);
    }
}(window));
