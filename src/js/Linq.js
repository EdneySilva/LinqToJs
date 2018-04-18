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

    function AggregateQueryProvider() {
        var context = this;
        this.compile = function (input, expression, type) {
            if (input.length == 0)
                return null;
            var useFirstElement = type === undefined || typeof type === typeof input[0];
            var seed = useFirstElement ? input[0] : type;
            input.slice(useFirstElement ? 1 : 0).forEach(function (value) {
                seed = expression(seed, value);
            });
            return seed;
        }

        return {
            compile: this.compile
        }
    }

    function AllQueryProvider() {

        this.compile = function (input, expression) {
            for (var i = 0; i < input.length; i++) 
                if (!expression(input[i]))
                    return false;
            return true;
        }

        return {
            compile: this.compile
        };
    }

    function AnyQueryProvider() {

        this.compile = function (input, expression) {
            if (expression == null)
                return input.length > 0;
            for (var i = 0; i < input.length; i++) 
                if (expression(input[i]))
                    return true;
            return false;
        }

        return {
            compile: this.compile
        };
    }

    function CountQueryProvider() {
        var context = this;
        this.compile = function (input, expression) {
            if (expression == null)
                return input.length;
            return input.filter(expression).length;
        }
        return {
            compile: this.compile
        };
    }

    function ObjectEqualitor() {

        this.equals = function (a, b, expression) {
            return a.hashCode() === b.hashCode();
        }
        return {
            equals: this.equals
        }
    }

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

    function DistinctQueryProvider() {

        var onlyComplexyUnique = function (expression, equalitor) {
            var equalitor = equalitor;
            return function (valueA, index, self) {
                return self.findIndex(function (valueB) {
                    return equalitor.equals(valueA, valueB, expression);
                }) === index;
            };
        }

        var onlyUnique = function (expression, equalitor) {
            return function (value, index, self) {
                return self.indexOf(value) === index;
            }
        }

        this.compile = function (input, expression) {
            if (input.length == 0)
                return input;
            var equalitor = null;
            var isObject = typeof input[0] === "object";
            if (expression == null && isObject)
                equalitor = new ObjectEqualitor();
            if (expression == null)
                equalitor = new SampleEqualitor();
            else
                equalitor = typeof expression(input[0]) === "object" ? new ComplexEqualitor() : new SampleEqualitor();
            
            var uniqueSelector = isObject ? onlyComplexyUnique : onlyUnique;

            return input.filter(uniqueSelector(expression, equalitor));
        }

        return {
            compile: this.compile
        };
    }

    function FirstQueryProvider() {
        var context = this;
        this.compile = function (input, expression) {
            if (input.length == 0)
                throw "Collection is empty";
            if (expression == null)
                return input[0];
            var index = input.findIndex(expression);
            if (index < 0)
                throw "Element not found";
            return input[index];
        }

        return {
            compile: this.compile
        }
    }

    function GroupByQueryProvider() {
        var context = this;
        this.compile = function (input, expressions) {
            if (input.length == 0)
                return null;
            var groupedData = new GroupDictionary();
            var keyExpression = expressions.key;
            var valueExpression = expressions.value || function (e) { return e };
            input.forEach((value, index) => {
                var key = keyExpression(value);
                groupedData.add(keyExpression(value), valueExpression(value));
            });
            return groupedData.toArray();
        }

        return {
            compile: this.compile
        }
    }

    function JoinQueryProvider() {

        var context = this;

        this.compare = function (a, b) {

            return true;
        }

        this.compile = function (input, expression) {
            if (expression.inner.length == 0 || input.length == 0)
                return [];
            var result = [];

            function comparer(obj) {
                var properties = [];
                for (var i in obj) {
                    properties.push(i);
                }
            }

            for (var i in input) {
                var outerKey = expression.outerKeySelector(input[i]);
                result = result.concat(expression.inner.filter(function (value) {
                    return context.compare(outerKey, expression.innerKeySelector(value));
                }).map(function (value) {
                    return expression.resultSelector(input[i], value);
                }));
            }
            return result;
        }

        return {
            compile: this.compile
        };
    }

    function LastQueryProvider() {
        var context = this;

        this.compile = function (input, expression) {
            if (input.length == 0)
                throw "Collection is empty";
            if (expression == null)
                return input[input.length - 1];
            var results = input.filter(expression)
            if (results.length == 0)
                throw "Element not founded";
            return results[results.length - 1];
        }

        return {
            compile: this.compile
        }
    }

    function OrderByQueryProvider() {

        var algorithims = {

            asc: function (a, b, expression) {
                if (expression(a) < expression(b))
                    return -1;
                else if (expression(a) > expression(b))
                    return 1;
                return 0;
            },
            desc: function (a, b, expression) {
                if (expression(a) > expression(b))
                    return -1;
                else if (expression(a) < expression(b))
                    return 1;
                return 0;
            }
        }

        this.compile = function (input, expression) {
            var expressions = expression();
            function sortByMultipleKey(keys) {
                return function (a, b) {
                    if (keys.length == 0)
                        return 0;
                    key = keys[0];
                    var result = algorithims[key.dir](a, b, key.expression);
                    if (result != 0)
                        return result;
                    return sortByMultipleKey(keys.slice(1))(a, b);
                }
            }
            return input.sort(sortByMultipleKey(expressions));
        }
        return {
            compile: this.compile
        }
    }

    function SelectQueryProvider() {
        this.compile = function (input, expression) {
            return input.map(expression);
        }
        return {
            compile: this.compile
        };
    }

    function SelectManyQueryProvider() {

        this.compile = function (input, expression) {
            var array = [];
            input.forEach((value) => {
                var result = expression(value);
                array = array.concat(result.toString() === "Queryable" ? result.toArray() : result);
            });
            return array;
        }

        return {
            compile: this.compile
        };
    }

    function SkipQueryProvider() {
        this.compile = function (input, expression) {
            var skip = expression;
            if (skip >= input.length)
                return [];
            return input.slice(skip, input.length);
        }

        return {
            compile: this.compile
        }
    }

    function SumQueryProvider() {
        var context = this;
        this.compile = function (input, expression) {
            var sum = 0;
            if (input.length == 0)
                return sum;
            if (expression == null && typeof input[0] === typeof 0) {
                input.forEach(f => sum += f);
                return sum;
            }
            input.forEach((f) => {
                sum += expression(f);
            });
            return sum;
        }
        return {
            compile: this.compile
        };
    }

    function TakeQueryProvider() {
        this.compile = function (input, expression) {
            var take = expression;
            if (take >= input.length)
                return input;
            return input.slice(0, take);
        }

        return {
            compile: this.compile
        }
    }

    function WhereQueryProvider() {

        this.compile = function (input, expression) {
            return input.filter(expression);
        }
        return {
            compile: this.compile
        };
    }

    function UnionQueryProvider() {

        var context = this;

        this.compare = function (a, b) {
            if (typeof a != typeof b)
                return false;
            for (var i in a) {
                if (b[i] === undefined)
                    return false;
            }
            return true;
        }

        this.compile = function (input, expression) {
            if (expression.length == 0)
                return input;
            if (input.length > 0 && !context.compare(input[0], expression[0]))
                throw "The collection types is not equal";
            return input.concat(expression);
        }
        return {
            compile: this.compile
        };
    }

    window.queryProviderCache = (function () {
        var providers = {};
        return {
            add: function (name, value) {
                providers[name] = value;
            },
            provider: function (name) {
                return providers[name];
            }
        }
    }())
    window.queryProviderCache.add("aggregate", new AggregateQueryProvider());
    window.queryProviderCache.add("all", new AllQueryProvider());
    window.queryProviderCache.add("any", new AnyQueryProvider());
    window.queryProviderCache.add("distinct", new DistinctQueryProvider());
    window.queryProviderCache.add("first", new FirstQueryProvider());
    window.queryProviderCache.add("count", new CountQueryProvider());
    window.queryProviderCache.add("groupby", new GroupByQueryProvider());
    window.queryProviderCache.add("join", new JoinQueryProvider());
    window.queryProviderCache.add("last", new LastQueryProvider());
    window.queryProviderCache.add("orderby", new OrderByQueryProvider());
    window.queryProviderCache.add("select", new SelectQueryProvider());
    window.queryProviderCache.add("selectmany", new SelectManyQueryProvider());
    window.queryProviderCache.add("skip", new SkipQueryProvider());
    window.queryProviderCache.add("sum", new SumQueryProvider());
    window.queryProviderCache.add("take", new TakeQueryProvider());
    window.queryProviderCache.add("where", new WhereQueryProvider());
    window.queryProviderCache.add("union", new UnionQueryProvider());
}(window));

window.T = function () { }

function Queryable(collection) {

    var context = this;
    this.collection = collection;
    this.commands = [];
    this.expressionTree = new ExpressionTree();

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

var ExpressionTree = function () {

    this.expressionGroup = new GroupDictionary();

    this.add = function (providerName, expression) {
        //this.expressionGroup.add(providerName, expression);
        var queryProvider = window.queryProviderCache.provider(command);
        this.commands.push({ query: queryProvider, expressionBody: expression });
        return this;
    }

    this.compile = function () {

    }

    return this;
}
