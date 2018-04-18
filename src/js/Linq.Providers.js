
(function (window) {
   
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
