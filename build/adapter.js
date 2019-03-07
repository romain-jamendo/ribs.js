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
var Backbone = require("backbone");
var $ = require("jquery");
var _ = require("underscore");
var Adapter;
(function (Adapter_1) {
    var Request = /** @class */ (function () {
        function Request(options) {
            if (options === void 0) { options = { data: null, type: 'GET', url: '' }; }
            this.options = this.formatOptions(options);
        }
        Request.prototype.formatOptions = function (options) {
            return options;
        };
        Request.prototype.formatResponse = function (response) {
            return response;
        };
        Request.prototype.setRequestHeader = function (headerName, headerValue) {
            return this;
        };
        return Request;
    }());
    Adapter_1.Request = Request;
    var Adapter = /** @class */ (function () {
        function Adapter(options) {
            if (options === void 0) { options = {}; }
            this.options = this.formatOptions(options);
            this.requestBind = this.getRequestInstance.bind(this);
        }
        Adapter.prototype.formatOptions = function (options) {
            return options;
        };
        Adapter.prototype.load = function () {
            Backbone.ajax = this.requestBind;
        };
        Adapter.prototype.getRequestInstance = function (options) {
            if (options === void 0) { options = { data: null, type: 'GET', url: '' }; }
            return new Request(options);
        };
        return Adapter;
    }());
    Adapter_1.Adapter = Adapter;
    var DefaultAdapter = /** @class */ (function (_super) {
        __extends(DefaultAdapter, _super);
        function DefaultAdapter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DefaultAdapter.prototype.getRequestInstance = function (options) {
            if (options === void 0) { options = { data: null, type: 'GET', url: '' }; }
            //return (<any>$).ajax(options);
            return new DefaultRequest(options);
        };
        return DefaultAdapter;
    }(Adapter));
    Adapter_1.DefaultAdapter = DefaultAdapter;
    ;
    ;
    var DefaultRequest = /** @class */ (function (_super) {
        __extends(DefaultRequest, _super);
        function DefaultRequest(options) {
            var _this = _super.call(this, options) || this;
            _this.requestList = [];
            var errorList = [];
            var responseList = [];
            var successCallback = null;
            var errorCallback = null;
            // override success and error and call them after all request
            if (options.success) {
                successCallback = options.success;
                options.success = function (response, textStatus, jqXHR) {
                    responseList.push({ response: response, position: _this.requestList.indexOf(jqXHR) });
                    _this.dispatchResult(errorList, responseList, successCallback, errorCallback);
                };
            }
            if (options.error) {
                var errorCallback_1 = options.error;
                options.error = function (xhr, textStatus, errorThrown) {
                    if ('responseJSON' in xhr) {
                        errorList.push({ errorThrown: xhr.responseJSON, position: _this.requestList.indexOf(xhr) });
                    }
                    else {
                        errorList.push({ errorThrown: errorThrown, position: _this.requestList.indexOf(xhr) });
                    }
                    _this.dispatchResult(errorList, responseList, successCallback, errorCallback_1);
                };
            }
            if (options.data instanceof Array) {
                var requestOptions_1 = $.extend({}, options);
                options.data.forEach(function (dataParameters) {
                    requestOptions_1.data = dataParameters;
                    _this.doRequest(requestOptions_1);
                });
            }
            else {
                _this.doRequest(options);
            }
            return _this;
        }
        DefaultRequest.prototype.doRequest = function (options) {
            this.requestList.push($.ajax(options));
        };
        DefaultRequest.prototype.setRequestHeader = function (headerName, headerValue) {
            this.requestList.forEach(function (jqXhr) {
                jqXhr.setRequestHeader(headerName, headerValue);
            });
            return this;
        };
        DefaultRequest.prototype.formatOptions = function (options) {
            options = _super.prototype.formatOptions.call(this, options);
            // convert data for API Jamendo
            if (options.data instanceof Array) {
                this.originalData = options.data;
                var paramList_1 = [];
                var uniqueKeyParam_1 = {};
                options.data.forEach(function (value) {
                    var keys = Object.keys(value);
                    if (keys.length > 1) {
                        // Multi-parameters have individual request because they can't be combined with others simple request
                        paramList_1.push(_.extend({}, value));
                    }
                    else {
                        // Group by single attribute 
                        var attribute = keys[0];
                        if (!(attribute in uniqueKeyParam_1)) {
                            uniqueKeyParam_1[attribute] = [];
                        }
                        var dataValue = value[attribute];
                        if (dataValue instanceof Array) {
                            uniqueKeyParam_1[attribute].splice.apply(uniqueKeyParam_1[attribute], [uniqueKeyParam_1[attribute].length, 0].concat(dataValue));
                        }
                        else {
                            uniqueKeyParam_1[attribute].push(dataValue);
                        }
                    }
                });
                for (var attribute in uniqueKeyParam_1) {
                    var dataAttribute = {};
                    dataAttribute[attribute] = _.uniq(uniqueKeyParam_1[attribute].sort(), true);
                    paramList_1.push(dataAttribute);
                }
                options.data = paramList_1;
            }
            else {
                if (typeof options.data === 'string') {
                    this.originalData = options.data.substr(0);
                }
                else {
                    this.originalData = _.extend({}, options.data);
                }
            }
            return options;
        };
        DefaultRequest.prototype.dispatchResult = function (errorList, responseList, successCallback, errorCallback) {
            if (errorList.length + responseList.length >= this.requestList.length) {
                if (errorList.length) {
                    errorList.sort(function (a, b) { return a.position - b.position; });
                    errorCallback(this, '', errorList.map(function (value) { return value.errorThrown; }));
                }
                else {
                    if (this.options.data instanceof Array) {
                        responseList.sort(function (a, b) { return a.position - b.position; });
                        successCallback(_.flatten(responseList.map(function (value) { return value.response; })));
                    }
                    else {
                        successCallback(responseList[0].response);
                    }
                }
            }
        };
        return DefaultRequest;
    }(Request));
    Adapter_1.DefaultRequest = DefaultRequest;
})(Adapter = exports.Adapter || (exports.Adapter = {}));
exports.default = Adapter;
//# sourceMappingURL=adapter.js.map