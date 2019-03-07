'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var ViewHelper;
(function (ViewHelper) {
    var viewHelpers = {};
    function add(helperName, helperCallback) {
        viewHelpers[helperName] = helperCallback;
    }
    ViewHelper.add = add;
    function remove(helperName) {
        delete viewHelpers[helperName];
    }
    ViewHelper.remove = remove;
    ;
    function get() {
        return viewHelpers;
    }
    ViewHelper.get = get;
    ;
})(ViewHelper = exports.ViewHelper || (exports.ViewHelper = {}));
exports.default = ViewHelper;
//# sourceMappingURL=viewHelper.js.map