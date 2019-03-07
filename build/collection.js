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
var _ = require("underscore");
var Ribs = require("./ribs");
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    function Collection(models, options) {
        var _this = _super.call(this, models, options) || this;
        _this.collectionSource = null;
        _this._isRange = false;
        _this._currentRange = 0;
        _this._lengthRange = 5;
        _this.isCircularRange = false;
        _this.isClose = false;
        if (_this.options.adapter) {
            _this.adapter = options.adapter;
        }
        else {
            _this.adapter = new Ribs.Adapter.DefaultAdapter();
        }
        return _this;
    }
    Collection.prototype.initialize = function (models, options) {
        this.options = options || {};
        // if oninitialize exists
        if (this.onInitialize) {
            // execute it now
            this.onInitialize(options);
        }
    };
    Collection.prototype.batchSave = function () {
    };
    Collection.prototype.sync = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        this.adapter.load();
        return _super.prototype.sync.apply(this, arg);
    };
    Collection.prototype.getFilteredCollection = function (onlyDatas, notDatas) {
        var _this = this;
        var filteredCollection = new Ribs.Collection();
        if (this.collectionSource === null) {
            filteredCollection.collectionSource = this;
        }
        else {
            filteredCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.
        }
        filteredCollection.add(this.getFilteredModels(this.models, onlyDatas, notDatas));
        var selfAddCallback = function (models, collection, options) {
            var newItems = _this.getFilteredModels(models, onlyDatas, notDatas);
            filteredCollection.add(newItems, options);
        };
        this.listenTo(this, 'add', selfAddCallback);
        var selfRemoveCallback = function (models, collection, options) {
            filteredCollection.remove(models, options);
        };
        this.listenTo(this, 'remove', selfRemoveCallback);
        var selfResetCallback = function (collection, options) {
            var newModels = _this.getFilteredModels(collection.models, onlyDatas, notDatas);
            filteredCollection.reset.call(filteredCollection, newModels, options);
        };
        this.listenTo(this, 'reset', selfResetCallback);
        filteredCollection.listenTo(filteredCollection, 'close:collection', function () {
            _this.stopListening(_this, 'add', selfAddCallback);
            _this.stopListening(_this, 'remove', selfRemoveCallback);
            _this.stopListening(_this, 'reset', selfResetCallback);
        });
        /*
        this.on('update', (collection, options) => {
 
            filteredCollection.trigger('update', filteredCollection, options);
 
        });*/
        /**
            * Now, I don't find the utility to listen sync event... Uncomment if you find it ;)
        var that = this;
        this.on('sync', function(model, responseServer, options) {
            
            var newItems = getFilteredModels(that.models, onlyDatas, notDatas);
            
            filteredCollection.add(model, options);
            
        });
            */
        return filteredCollection;
    };
    Collection.prototype.getRange = function (start, length) {
        var _this = this;
        var rangeCollection = new Collection([], this.options);
        if (this.collectionSource === null) {
            rangeCollection.collectionSource = this;
        }
        else {
            rangeCollection.collectionSource = this.collectionSource; //Should be the root or the parent ?... that is the question.
        }
        rangeCollection._isRange = true;
        rangeCollection.isCircularRange = this.isCircularRange;
        rangeCollection._currentRange = start;
        rangeCollection._lengthRange = length;
        rangeCollection.set(this.getRangeOfCollection(this, start, length));
        var selfCallback = _.debounce((function () {
            rangeCollection.set(this.getRangeOfCollection(this, start, length));
        }).bind(this), 16); // debounce to avoid sort and update trigger on added model.
        this.listenTo(this, 'update sync reset sort', selfCallback);
        rangeCollection.listenTo(rangeCollection, 'close:collection', function () {
            _this.stopListening(_this, 'update sync reset sort', selfCallback);
        });
        return rangeCollection;
    };
    Collection.prototype.setIsCircularRange = function (isCircularRange) {
        this.isCircularRange = true;
        return this;
    };
    Collection.prototype.rangeNext = function () {
        if (!this._isRange) {
            return this;
        }
        if (++this._currentRange >= this.collectionSource.length) {
            this._currentRange = 0;
        }
        this.nextRange.call(this);
        return this;
    };
    Collection.prototype.rangeNextPage = function () {
        if (!this._isRange) {
            return this;
        }
        if ((this._currentRange += this._lengthRange) >= this.collectionSource.length) {
            this._currentRange = 0; //Really a circular pagination???
        }
        this.nextRange.call(this);
        return this;
    };
    Collection.prototype.rangeGoTo = function (index, newLength) {
        if (!this._isRange) {
            return this;
        }
        if (newLength !== undefined) {
            this._lengthRange = newLength;
        }
        if ((this._currentRange = index) >= this.collectionSource.length) {
            this._currentRange = 0;
        }
        else if (this._currentRange < 0) {
            if (this.isCircularRange) {
                this._currentRange += this.collectionSource.length;
            }
            else {
                this._currentRange = 0;
            }
        }
        this.nextRange.call(this);
        return this;
    };
    Collection.prototype.setRangeLength = function (length) {
        if (!this._isRange) {
            return this;
        }
        this._lengthRange = Math.max(length, 0);
        this.nextRange.call(this);
        return this;
    };
    Collection.prototype.getFilteredModels = function (models, onlyDatas, notDatas) {
        if (!(models instanceof Array)) {
            models = [models];
        }
        var onlyModels;
        var modelCollection = new Backbone.Collection(models);
        if (!!onlyDatas) {
            onlyModels = modelCollection.where(onlyDatas);
        }
        else {
            onlyModels = models;
        }
        var notModels;
        if (!!notDatas) {
            notModels = modelCollection.where(notDatas);
        }
        else {
            notModels = [];
        }
        return _.filter(onlyModels, function (model) {
            return notModels.indexOf(model) === -1;
        });
    };
    Collection.prototype.getRangeOfCollection = function (collection, start, length) {
        if (collection.length < start) {
            return [];
        }
        return collection.models.slice(start, start + length);
    };
    Collection.prototype.nextRange = function () {
        var models = this.getRangeOfCollection(this.collectionSource, this._currentRange, this._lengthRange);
        if (this._currentRange + this._lengthRange >= this.collectionSource.length) {
            models = models.concat(this.getRangeOfCollection(this.collectionSource, 0, this._lengthRange - (this.collectionSource.length - this._currentRange)));
        }
        this.reset(models);
    };
    Collection.prototype.close = function () {
        var _this = this;
        this.isClose = true;
        this.trigger('close:collection', this);
        this.trigger('close', this);
        if (this.models) {
            this.models.forEach(function (model) {
                if ('close' in model && model.collection === _this) {
                    model.close();
                }
            });
            //this.models = null;
        }
    };
    Object.defineProperty(Collection.prototype, "length", {
        get: function () {
            return this.models ? this.models.length : 0;
        },
        enumerable: true,
        configurable: true
    });
    // Internal method called by both remove and set.
    // Override Backbone.Collection._remvoeModels original methods because of fixes not release yet but already in github.
    Collection.prototype._removeModels = function (models, options) {
        var removed = [];
        for (var i = 0; i < models.length; i++) {
            var model = this.get(models[i]);
            if (!model)
                continue;
            var index = this.indexOf(model);
            this.models.splice(index, 1);
            //this.length--;
            // Remove references before triggering 'remove' event to prevent an
            // infinite loop. #3693
            delete this._byId[model.cid];
            var id = this.modelId(model.attributes);
            if (id != null)
                delete this._byId[id];
            if (!options.silent) {
                options.index = index;
                model.trigger('remove', model, this, options);
            }
            removed.push(model);
            this._removeReference(model, options);
        }
        return removed;
    };
    return Collection;
}(Backbone.Collection));
exports.Collection = Collection;
exports.default = Collection;
//# sourceMappingURL=collection.js.map