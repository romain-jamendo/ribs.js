'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Backbone = require("backbone");
var _ = require("underscore");
var Controller = /** @class */ (function () {
    function Controller(options, configuration, router) {
        this.options = options || {};
        this.router = router || new Backbone.Router();
        this.configuration = configuration || {};
        this.initialize(options, configuration, router);
        _.extend(this, Backbone.Events);
    }
    Object.defineProperty(Controller.prototype, "promise", {
        get: function () {
            return this._promise;
        },
        set: function (value) {
            this._promise = value;
        },
        enumerable: true,
        configurable: true
    });
    Controller.prototype.clear = function () { };
    Controller.prototype.initialize = function (options, configuration, router) {
        // execute it now
        this.onInitialize(this.options, configuration, this.router);
    };
    Controller.prototype.onInitialize = function (options, configuration, router) {
    };
    Controller.prototype.create = function (skeleton) {
        return null;
    };
    Controller.extend = function () {
        return Backbone.Model.extend.apply(this, arguments);
    };
    return Controller;
}());
exports.Controller = Controller;
exports.default = Controller;
//# sourceMappingURL=controller.js.map