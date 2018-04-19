window.testConsole = function (context) {
    console.log("Press [F8] to start the tests");
    debugger
    context.call(this);
};

window.it = function (message, context) {
    var message = message;
    var context = context;
    var $this = {
        given: function () {

        }
    };
    var descriptor = new Descriptor();
    context.call($this, descriptor);
    var assertation = new Assert();
    if (!descriptor.assert(assertation))
        console.error("* Test Failed:\n" + message);
    else
        console.log("Test Passed [" + message + "]");

}

var Descriptor = function () {
    var descriptor = {}
    this.given = function () {
        descriptor.parameters = arguments;
        return new Given(descriptor);
    }

    this.assert = function (assertation) {
        var result = descriptor.scenario.apply(descriptor, descriptor.parameters);
        return descriptor.assertation.call(descriptor, result, assertation);
    }
    return this;
}

this.Given = function (descriptor) {
    var descriptor = descriptor;
    this.when = function (scenario) {
        descriptor.scenario = scenario;
        return new When(descriptor);
    }
    return {
        when: this.when,
    }
}

When = function (descriptor) {
    var descriptor = descriptor;

    this.then = function (assert) {
        descriptor.assertation = assert;
    }
    return {
        then: this.then
    }
}

Assert = function () {
    this.equals = function (a, b) {
        if (typeof a !== "object")
            return a == b;
        return new ObjectEqualitor().equals(a, b);
    }

    this.isTrue = function (value) {
        return value === true;
    }

    this.isFalse = function (value) {
        return value === false;
    }

    return {
        isTrue: this.isTrue,
        isFalse: this.isFalse,
        equals: this.equals
    }
}

window.registerTest = (function (window) {
    var testes = [];

    window.runAllTests = function () {
        for (var i = 0; i < testes.length; i++) {
            testes[i].Test();
        }
    }

    window.runTest = function (name) {

    }

    window.debugTest = function (name) {

    }

    return function (name, test) {
        testes.push({ Name: name, Test: test });
    }
}(window));

window.onload = function () {
    debugger;
    window.runAllTests();
}
