function GroupDictionary() {
    var context = this;
    this.indexedKeys = [];
    this.groupedData = [];

    this.simpleCompare = function (key) {
        return context.indexedKeys.indexOf(key);
    }

    this.objectCompare = function (key) {
        var index = context.indexedKeys.findIndex((value) => {
            for (var i in key) {
                if (key[i] !== value[i])
                    return false;
            }
            return true;
        });
        return index;
    }

    this.add = function (key, value) {
        var index = typeof key === "object" ? context.objectCompare(key) : context.simpleCompare(key);
        if (index < 0) {
            context.indexedKeys.push(key);
            context.groupedData.push({ key: key, value: [] });
            index = context.groupedData.length - 1;
        }
        context.groupedData[index].value.push(value);
    }

    return {
        add: this.add,
        toArray: function () { return context.groupedData; }
    }
}

window.T = function () { }

function Queryable(collection) {

    var context = this;
    this.collection = collection;
    this.commands = [];

    this.addCommand = function (command, expression) {
        var queryProvider = window.queryProviderCache.provider(command);
        this.commands.push({ query: queryProvider, expressionBody: expression });
        return this;
    }

    this.aggregate = function (type, expression) {

        var queryProvider = window.queryProviderCache.provider("aggregate");
        var _expression = {};
        if (arguments.length < 2)
            return queryProvider.compile(context.compile(), arguments[0]);
        else
            return queryProvider.compile(context.compile(), arguments[1], arguments[0]);
    }

    this.all = function (expression) {
        return context.addCommand("all", expression).compile();
    }

    this.any = function (expression) {
        return context.addCommand("any", expression || null).compile();
    }

    this.compile = function () {
        var compiledResult = context.collection;
        context.commands.forEach((value, index) => {
            compiledResult = value.query.compile(compiledResult, value.expressionBody);
        });
        context.commands = [];
        return compiledResult;
    }

    this.count = function (expression) {
        context.addCommand("count", expression);
        return context.compile();
    }

    this.distinct = function (expression) {
        context.addCommand("distinct", expression || null);
        return this;
    }

    this.first = function (expression) {
        return context.addCommand("first", expression || null).compile();
    }

    this.groupBy = function (keyExpression, valueExpression) {
        var expression = { key: keyExpression };
        if (valueExpression)
            expression["value"] = valueExpression;
        context.addCommand("groupby", expression);
        return this;
    }

    this.join = function (inner, outerKeySelector, innerKeySelector, resultSelector) {
        context.addCommand("join", { inner: inner, outerKeySelector: outerKeySelector, innerKeySelector: innerKeySelector, resultSelector: resultSelector });
        return this;
    }

    this.last = function (expression) {
        return context.addCommand("last", expression).compile();
    }

    this.orderBy = function (expression) {
        return OrderedQueryable.call(this, context, "orderby", { dir: "asc", expression: expression });
    }

    this.orderByDesc = function (expression) {
        return OrderedQueryable.call(this, context, "orderby", { dir: "desc", expression: expression });
    }

    this.select = function (expression) {
        context.addCommand("select", expression);
        return this;
    }

    this.selectMany = function (expression) {
        context.addCommand("selectmany", expression);
        return this;
    }

    this.skip = function (expression) {
        context.addCommand("skip", expression);
        return this;
    }

    this.sum = function (expression) {
        return context.addCommand("sum", expression || null).compile();
    }

    this.take = function (expression) {
        context.addCommand("take", expression);
        return this;
    }

    this.toArray = function () {
        return context.compile();
    }

    this.toJsonString = function () {
        return JSON.stringify(this.compile());
    }

    this.union = function (collection) {
        context.addCommand("union", collection);
        return this;
    }

    this.where = function (expression) {
        context.addCommand("where", expression);
        return this;
    }

    return {
        aggregate: function (type, expression) { return context.aggregate.apply(this, arguments); },
        all: this.all,
        any: this.any,
        count: this.count,
        distinct: this.distinct,
        first: this.first,
        groupBy: this.groupBy,
        join: this.join,
        last: this.last,
        orderBy: this.orderBy,
        orderByDesc: this.orderByDesc,
        select: this.select,
        selectMany: this.selectMany,
        skip: this.skip,
        sum: this.sum,
        take: this.take,
        toArray: this.toArray,
        toJsonString: this.toJsonString,
        union: this.union,
        where: this.where,
        toString: function () {
            return "Queryable";
        }
    }
}

Queryable.extends = function (objectCreator) {
    return function (context, provider, expression) {
        var value = objectCreator(context, provider, expression);
        for (var i in this) {
            value[i] = this[i];
        }
        return value;
    };
}

var OrderedQueryable = Queryable.extends(function (context, provider, expression) {
    var context = context;
    var expressions = [expression];

    context.addCommand(provider, function () {
        return expressions;
    });

    this.thenBy = function (expression) {
        expressions.push({ dir: "asc", expression: expression });
        return this;
    }

    this.thenByDesc = function (expression) {
        expressions.push({ dir: "desc", expression: expression });
        return this;
    }

    return {
        thenBy: this.thenBy,
        thenByDesc: this.thenByDesc
    }
});
