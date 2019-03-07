'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var eventsManager_1 = require("./eventsManager");
var Backbone = require("backbone");
var _ = require("underscore");
var Router = /** @class */ (function (_super) {
    __extends(Router, _super);
    function Router(options) {
        return _super.call(this, options) || this;
    }
    Router.prototype.initialize = function () {
    };
    Router.prototype.route = function (route, name, callback) {
        var _this = this;
        if (!_.isRegExp(route))
            route = this._routeToRegExp(route);
        if (_.isFunction(name)) {
            callback = name;
            name = '';
        }
        if (!callback)
            callback = this[name];
        Backbone.history.route(route, function (fragment) {
            var args = _this._extractParameters(route, fragment);
            // we use a callback function to allow async calls, the
            // original backbone code uses an if (see below)
            _this.execute(callback, args, name, function (executeRoute) {
                if (executeRoute) {
                    _this.trigger.apply(_this, ['route:' + name].concat(args));
                    _this.trigger('route', name, args);
                    Backbone.history.trigger('route', _this, name, args);
                }
            });
            /*
            if (router.execute(callback, args, name) !== false) {
                
                router.trigger.apply(router, ['route:' + name].concat(args));
                router.trigger('route', name, args);
                Backbone.history.trigger('route', router, name, args);
                
            }
            */
        });
        return this;
    };
    Router.prototype.execute = function (callback, routeArguments, routeName, internalCallback) {
        // pre-route event
        eventsManager_1.default.trigger(eventsManager_1.default.constants.ROUTER_PREROUTE, { 'routeArguments': routeArguments, 'routeName': routeName });
        if (callback)
            callback.apply(this, routeArguments);
        // post route event
        eventsManager_1.default.trigger(eventsManager_1.default.constants.ROUTER_POSTROUTE, { 'routeArguments': routeArguments, 'routeName': routeName });
        if (internalCallback !== undefined) {
            // can return true or false, if false is returned the current
            // route will get aborted
            internalCallback(true);
        }
        else {
            // can return true or false, if false is returned the current
            // route will get aborted
            return true;
        }
    };
    Router.prototype.getCurrentRoute = function () {
        return Backbone.history.fragment;
    };
    return Router;
}(Backbone.Router));
exports.Router = Router;
exports.default = Router;
//# sourceMappingURL=router.js.map