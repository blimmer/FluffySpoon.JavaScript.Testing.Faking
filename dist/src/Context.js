"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utilities_1 = require("./Utilities");
var Arguments_1 = require("./Arguments");
var ProxyPropertyContextBase = /** @class */ (function () {
    function ProxyPropertyContextBase() {
        this.name = null;
        this.type = null;
    }
    return ProxyPropertyContextBase;
}());
exports.ProxyPropertyContextBase = ProxyPropertyContextBase;
var ProxyPropertyContext = /** @class */ (function (_super) {
    __extends(ProxyPropertyContext, _super);
    function ProxyPropertyContext() {
        return _super.call(this) || this;
    }
    ProxyPropertyContext.prototype.promoteToMethod = function () {
        var methodContext = this;
        methodContext.method = new ProxyMethodContext();
        methodContext.type = 'function';
        return methodContext;
    };
    return ProxyPropertyContext;
}(ProxyPropertyContextBase));
exports.ProxyPropertyContext = ProxyPropertyContext;
var ProxyMethodPropertyContext = /** @class */ (function (_super) {
    __extends(ProxyMethodPropertyContext, _super);
    function ProxyMethodPropertyContext() {
        var _this = _super.call(this) || this;
        _this.method = new ProxyMethodContext();
        return _this;
    }
    return ProxyMethodPropertyContext;
}(ProxyPropertyContextBase));
exports.ProxyMethodPropertyContext = ProxyMethodPropertyContext;
var ProxyMethodContext = /** @class */ (function () {
    function ProxyMethodContext() {
        this.arguments = [];
    }
    return ProxyMethodContext;
}());
exports.ProxyMethodContext = ProxyMethodContext;
var ProxyCallRecords = /** @class */ (function () {
    function ProxyCallRecords() {
        this.expected = null;
        this.actual = [];
    }
    return ProxyCallRecords;
}());
exports.ProxyCallRecords = ProxyCallRecords;
var ProxyExpectation = /** @class */ (function () {
    function ProxyExpectation() {
        this.callCount = void 0;
        this.negated = false;
    }
    return ProxyExpectation;
}());
exports.ProxyExpectation = ProxyExpectation;
var ProxyObjectContext = /** @class */ (function () {
    function ProxyObjectContext() {
        this.calls = new ProxyCallRecords();
        this.property = new ProxyPropertyContext();
    }
    ProxyObjectContext.prototype.setExpectations = function (count, negated) {
        var call = new ProxyExpectation();
        call.callCount = count;
        call.negated = negated;
        this.calls.expected = call;
    };
    ProxyObjectContext.prototype.findActualPropertyCalls = function (propertyName) {
        return this.calls.actual.filter(function (x) {
            return x.property.name === propertyName;
        });
    };
    ProxyObjectContext.prototype.findActualMethodCalls = function (propertyName, args) {
        var result = this.calls
            .actual
            .filter(function (x) { return x.property.name === propertyName; })
            .filter(function (x) {
            if (args === void 0)
                return true;
            if (x.property.type !== 'function')
                return false;
            var args1 = x.argumentsSnapshot;
            var args2 = args;
            if (!args1 || !args2)
                return false;
            var firstArg1 = args1[0];
            var firstArg2 = args2[0];
            if (firstArg1 instanceof Arguments_1.AllArguments || firstArg2 instanceof Arguments_1.AllArguments)
                return true;
            if (args1.length !== args2.length)
                return false;
            for (var i = 0; i < args1.length; i++) {
                var arg1 = args1[i];
                var arg2 = args2[i];
                if (!Utilities_1.areArgumentsEqual(arg1, arg2))
                    return false;
            }
            return true;
        });
        return result;
    };
    ProxyObjectContext.prototype.getLastCall = function () {
        return this.calls.actual[this.calls.actual.length - 1];
    };
    ProxyObjectContext.prototype.removeActualPropertyCall = function (call) {
        var callIndex = this.calls.actual.indexOf(call);
        this.calls.actual.splice(callIndex, 1);
    };
    ProxyObjectContext.prototype.addActualPropertyCall = function () {
        var _this = this;
        var existingCall;
        var existingCallCandidates = this.calls.actual.filter(function (x) {
            return x.property.name === _this.property.name;
        });
        var thisProperty = this.property;
        if (thisProperty.type === 'function') {
            existingCall = existingCallCandidates.filter(function (x) {
                return x.property.type === thisProperty.type &&
                    Utilities_1.areArgumentsEqual(x.argumentsSnapshot, thisProperty.method.arguments);
            })[0];
        }
        else {
            existingCall = existingCallCandidates[0];
        }
        if (!existingCall) {
            existingCall = new ProxyCallRecord(this.property);
            this.calls.actual.push(existingCall);
        }
        existingCall.callCount++;
        this.fixExistingCallArguments();
        return existingCall;
    };
    ProxyObjectContext.prototype.fixExistingCallArguments = function () {
        var e_1, _a;
        var actualCalls = this.calls.actual;
        try {
            for (var _b = __values(__spread(actualCalls)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var existingCall = _c.value;
                var existingCallProperty = existingCall.property;
                if (existingCallProperty.type === 'function' && existingCall.argumentsSnapshot === null)
                    existingCall.argumentsSnapshot = existingCallProperty.method.arguments;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return ProxyObjectContext;
}());
exports.ProxyObjectContext = ProxyObjectContext;
var ProxyCallRecord = /** @class */ (function () {
    function ProxyCallRecord(property) {
        this.callCount = 0;
        this.property = property || null;
        this.argumentsSnapshot = property && property.type === 'function' ? property.method.arguments : null;
    }
    return ProxyCallRecord;
}());
exports.ProxyCallRecord = ProxyCallRecord;
//# sourceMappingURL=Context.js.map