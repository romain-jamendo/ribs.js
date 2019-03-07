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
var viewHelper_1 = require("./viewHelper");
var container_1 = require("./container");
var Backbone = require("backbone");
var $ = require("jquery");
var _ = require("underscore");
var FSPromise = require("FSPromise");
var Promise = FSPromise.FSPromise;
var View = /** @class */ (function (_super) {
    __extends(View, _super);
    function View(options) {
        var _this = _super.call(this, options) || this;
        _this.isDispatch = false;
        return _this;
    }
    View.prototype.initialize = function (options) {
        this.pendingViewModel = [];
        this.waitingForSort = false;
        this.waitingForUpdateCollection = false;
        this.isCollectionRendered = false;
        this.isSubviewRendered = false;
        this.isCreating = false;
        this.createPromise = null;
        this.isClose = false;
        this.pendingViewModelPromise = [];
        this.options = $.extend({}, View.defaultOptions, options || {});
        this.onInitializeStart();
        // collection children views, usefull when collection view gets
        // destroyed and we want to take some action on sub views
        this.referenceModelView = {};
        this.referenceModelView[this.options.listSelector] = {};
        if (this.collection) {
            this.listenTo(this.collection, 'add', this.addModel);
            this.listenTo(this.collection, 'remove', this.removeModel);
            this.listenTo(this.collection, 'reset', this.reset);
            this.listenTo(this.collection, 'sort', this.sortModel);
            this.listenTo(this.collection, 'update', this.updateCollection);
        }
        if (this.model) {
            this.listenTo(this.model, 'destroy', this.close);
        }
        this.removeModelCallback = this.removeModel.bind(this);
        this.destroyViewCallback = this.onDestroySubView.bind(this);
        this.onInitialize();
    };
    View.prototype.render = function () {
        var _this = this;
        this.onRenderStart();
        this.isCollectionRendered = false;
        this.isSubviewRendered = false;
        var htmlizeObject = this.htmlize();
        var doRender = function ($renderedTemplate) {
            if (_this.isClose) {
                return _this;
            }
            _this.setElement($renderedTemplate);
            if (_this.model && _this.options.reRenderOnChange) {
                _this.listenTo(_this.model, 'change', _this.reRenderModelView);
            }
            _this.onRender();
            _this.isDispatch = true;
            _this.lastRenderPromise = null;
            if (_this.pendingViewModelPromise.length) {
                return Promise.all(_this.pendingViewModelPromise).then(function () {
                    _this.onRenderAll();
                    return _this;
                });
            }
            if (_this.waitingForUpdateCollection) {
                _this._updateCollection();
                _this.waitingForUpdateCollection = false;
            }
            _this.onRenderAll();
            return _this;
        };
        if (htmlizeObject instanceof Promise) {
            if (!!this.lastRenderPromise) {
                this.lastRenderPromise.abort();
            }
            this.lastRenderPromise = htmlizeObject;
            return htmlizeObject.then(doRender);
        }
        return doRender(htmlizeObject);
    };
    View.prototype.reRenderModelView = function () {
        var _this = this;
        this.onRenderStart();
        this.$previousEl = this.$el;
        var htmlizeObject = this.htmlize();
        var doRerender = function ($renderedTemplate) {
            if (_this.isClose) {
                return _this;
            }
            _this.$previousEl.replaceWith($renderedTemplate);
            _this.$previousEl = null;
            _this.setElement($renderedTemplate);
            _this.onRender();
            _this.lastRenderPromise = null;
            _this.onRenderAll();
            return _this;
        };
        if (htmlizeObject instanceof Promise) {
            if (!!this.lastRenderPromise) {
                this.lastRenderPromise.abort();
            }
            this.lastRenderPromise = htmlizeObject;
            return htmlizeObject.then(doRerender);
        }
        else {
            return doRerender(htmlizeObject);
        }
    };
    View.prototype.htmlizeView = function () {
        var templateKeyValues;
        var templateData = {};
        var postTemplateData = { _view: this };
        if (this.model) {
            // model view
            // are there also templateVariables
            if (_.keys(this.options.templateVariables).length > 0) {
                templateKeyValues = $.extend(templateData, viewHelper_1.default.get(), this.options.templateVariables, this.getModelAsJson(), postTemplateData);
            }
            else {
                templateKeyValues = $.extend(templateData, viewHelper_1.default.get(), this.getModelAsJson(), postTemplateData);
            }
        }
        else if (_.keys(this.options.templateVariables).length > 0) {
            // templateVariables view
            templateKeyValues = $.extend(templateData, viewHelper_1.default.get(), this.options.templateVariables, postTemplateData);
        }
        else {
            // basic view
            templateKeyValues = $.extend(templateData, viewHelper_1.default.get(), postTemplateData);
        }
        var templateResult = this.template(templateKeyValues);
        if (templateResult instanceof Promise) {
            return templateResult;
        }
        return $(templateResult);
    };
    View.prototype.htmlize = function () {
        var _this = this;
        // is there a model or templateVariables or nothing?
        var viewHtml = this.htmlizeView();
        var doCollection = function ($renderedTemplate) {
            // and also a collection?
            _this.isCollectionRendered = true;
            if (_this.collection) {
                // for each model of the collection append a modelView to
                // collection dom
                if (_this.collection.models.length > 0) {
                    if (_this.pendingViewModelPromise) {
                        while (_this.pendingViewModelPromise.length) {
                            var promise = _this.pendingViewModelPromise.pop();
                            if (promise && 'abort' in promise) {
                                promise.abort();
                            }
                        }
                    }
                    if (_this.updatePromise) {
                        _this.updatePromise.abort();
                        _this.updatePromise = null;
                    }
                    var promiseList_1 = [];
                    _this.collection.models.forEach(function (model) {
                        promiseList_1.push(_this.addModel(model));
                    });
                    var $container = $renderedTemplate.find(_this.options.listSelector);
                    if ($container.length === 0) {
                        if (($container = $renderedTemplate.filter(_this.options.listSelector)).length === 0) {
                            $container = $();
                        }
                    }
                    _this.isCollectionRendered = false;
                    return Promise.all(promiseList_1).then(function () {
                        _this.isCollectionRendered = true;
                        _this.updateCollection($container);
                        return $renderedTemplate;
                    });
                }
            }
            return $renderedTemplate;
        };
        var doSubView = function ($renderedTemplate) {
            _this.isSubviewRendered = true;
            var promiseList = [];
            _.each(_this.referenceModelView, function (modelViewList, selector) {
                if (selector === _this.options.listSelector) {
                    return;
                }
                _.each(modelViewList, function (modelView) {
                    _this.prepareAddedView(modelView);
                    promiseList.push(modelView.create());
                });
            });
            var allPromisesSubView = null;
            if (promiseList.length) {
                if (_this.options.subviewAsyncRender) {
                    _.each(_this.referenceModelView, function (modelViewList, selector) {
                        if (selector !== _this.options.listSelector) {
                            _this._addView(selector, Object.keys(modelViewList).map(function (cid) { return modelViewList[cid]; }), $renderedTemplate);
                        }
                    });
                }
                else {
                    allPromisesSubView = Promise.all(promiseList).then(function () {
                        var promiseAddView = [];
                        _.each(_this.referenceModelView, function (modelViewList, selector) {
                            if (selector !== _this.options.listSelector) {
                                promiseAddView.push(_this._addView(selector, Object.keys(modelViewList).map(function (cid) { return modelViewList[cid]; }), $renderedTemplate));
                            }
                        });
                        if (promiseAddView.length) {
                            return Promise.all(promiseAddView).then(function () {
                                return $renderedTemplate;
                            });
                        }
                        return $renderedTemplate;
                    });
                }
            }
            if (allPromisesSubView !== null) {
                return allPromisesSubView;
            }
            return $renderedTemplate;
        };
        if (viewHtml instanceof Promise) {
            return viewHtml.then(doCollection).then(doSubView);
        }
        var doCollectionView = doCollection(viewHtml);
        if (doCollectionView instanceof Promise) {
            return doCollectionView.then(doSubView);
        }
        return doSubView(doCollectionView);
    };
    View.prototype.getModelAsJson = function () {
        var data;
        if (this.model) {
            data = this.model.toJSON();
        }
        return data;
    };
    View.prototype.getCollectionAsJson = function () {
        var data;
        if (this.collection) {
            data = this.collection.toJSON();
        }
        return data;
    };
    View.prototype.close = function () {
        var _this = this;
        this.isClose = true;
        this.onCloseStart();
        if (this.lastRenderPromise) {
            this.lastRenderPromise.abort();
            this.lastRenderPromise = null;
        }
        if (this.pendingViewModel.length) {
            this.pendingViewModel.splice(0, this.pendingViewModel.length);
            this.pendingViewModel = null;
        }
        if (this.pendingViewModelPromise.length) {
            while (this.pendingViewModelPromise.length) {
                var promise = this.pendingViewModelPromise.pop();
                if ('abort' in promise) {
                    promise.abort();
                }
            }
            this.pendingViewModelPromise = null;
        }
        if (this.updatePromise) {
            if ('abort' in this.updatePromise) {
                this.updatePromise.abort();
            }
            this.updatePromise = null;
        }
        this.$previousEl = null;
        if (this.createPromise) {
            if ('abort' in this.createPromise) {
                this.createPromise.abort();
            }
            this.createPromise = null;
        }
        this.trigger('close', this);
        // remove the view from dom and stop listening to events that were
        // added with listenTo or that were added to the events declaration
        this.remove();
        // unbind events triggered from within views using backbone events
        this.unbind();
        this.stopListening();
        if (!!this.collection) {
            // TODO: ...
            if ('close' in this.collection && (!this.options || this.options.closeCollectionOnClose !== false)) {
                this.collection.close();
            }
            this.collection = null;
        }
        if (this.referenceModelView !== null) {
            _.each(this.referenceModelView, function (modelViewCollection, selector) {
                _.each(modelViewCollection, function (modelView, cid) {
                    delete _this.referenceModelView[selector][cid];
                    _this.onModelRemoved(modelView);
                    modelView.stopListening(modelView, 'close', _this.destroyViewCallback);
                    modelView.close();
                });
            });
            this.referenceModelView = null;
        }
        if (!!this.model) {
            if (this.options) {
                if (this.options.removeModelOnClose === true && !!this.collection === true) { //!!this.model.collection === true) {
                    this.collection.remove(this.model);
                    //this.model.collection.remove(this.model);
                }
                if (this.options.closeModelOnClose !== false && 'close' in this.model) {
                    this.model.close();
                }
            }
            else if ('close' in this.model) {
                this.model.close();
            }
            this.model = null;
        }
        this.onClose();
    };
    View.prototype.create = function () {
        var _this = this;
        if (this.isDispatch === true) {
            return this.$el;
        }
        if (this.isCreating === true) {
            return this.createPromise;
        }
        var renderObject = this.render();
        if (renderObject instanceof Promise) {
            this.isCreating = true;
            return this.createPromise = renderObject.then(function (view) {
                _this.isCreating = false;
                return _this.$el;
            });
        }
        return this.$el;
    };
    View.prototype.clear = function () {
        container_1.default.clear(this.options.listSelector);
    };
    View.prototype.empty = function () {
        //Container.clear(this.options.listSelector);
        var _this = this;
        if (this.referenceModelView !== null) {
            _.each(this.referenceModelView, function (modelViewList, selector) {
                _.each(modelViewList, function (modelView, cid) {
                    delete _this.referenceModelView[selector][cid];
                    _this.onModelRemoved(modelView);
                    modelView.stopListening(modelView, 'close', _this.destroyViewCallback);
                    modelView.close();
                });
            });
            this.referenceModelView = {};
            if ('listSelector' in this.options) {
                this.referenceModelView[this.options.listSelector] = {};
            }
        }
    };
    View.prototype.reset = function (collection) {
        this.removeUnusedModelView(collection);
        _.each(collection.models, (function (newModel) {
            this.addModel(newModel);
        }).bind(this));
        this.updateCollection();
    };
    View.prototype.removeUnusedModelView = function (collection) {
        collection = collection || this.collection;
        var collectionModelView = this.referenceModelView[this.options.listSelector];
        if (!collectionModelView) {
            return;
        }
        _.each(collectionModelView, function (viewModel, cid) {
            if (!collection.get(cid)) {
                viewModel.close();
                delete collectionModelView[cid];
            }
        });
    };
    View.prototype.addModel = function (model) {
        var _this = this;
        if (this.isCollectionRendered === false) {
            return;
        }
        if (!(this.options.listSelector in this.referenceModelView)) {
            this.referenceModelView[this.options.listSelector] = {};
        }
        if (model.cid in this.referenceModelView[this.options.listSelector]) {
            var $element = this.referenceModelView[this.options.listSelector][model.cid].$el;
            this.pendingViewModel.push($element);
            return;
        }
        if (this.options.ModelView === null) {
            throw new Error('a collection view needs a ModelView passed on instantiation through the options');
        }
        var ModelView = this.options.ModelView;
        var mergedModelViewOptions = this.formatModelViewOptions($.extend({}, this.options.ModelViewOptions, { model: model, parentView: this }));
        var modelView = new ModelView(mergedModelViewOptions);
        var viewCreate = modelView.create();
        var doAddModel = function ($element) {
            _this.pendingViewModel.push($element);
            // TODO: use the container to manage subviews of a list
            //Container.add(this.options.listSelector, modelView);
            if (!(_this.options.listSelector in _this.referenceModelView)) {
                _this.referenceModelView[_this.options.listSelector] = {};
            }
            _this.referenceModelView[_this.options.listSelector][model.cid] = modelView;
            _this.onModelAdded(modelView);
            model.listenToOnce(model, 'close:model', _this.removeModelCallback);
            return $element;
        };
        if (viewCreate instanceof Promise) {
            this.pendingViewModelPromise.push(viewCreate);
            return viewCreate.then(doAddModel);
        }
        return Promise.resolve(doAddModel(viewCreate));
    };
    View.prototype.formatModelViewOptions = function (modelViewOptions) {
        return modelViewOptions;
    };
    View.prototype.removeModel = function (model) {
        var view = this.referenceModelView[this.options.listSelector][model.cid];
        if (view === undefined) {
            return view;
        }
        model.stopListening(model, 'close:model', this.removeModelCallback);
        // TODO: use the container to manage subviews of a list
        //Container.remove(this.options.listSelector, view.container);
        delete this.referenceModelView[this.options.listSelector][model.cid];
        this.onModelRemoved(view);
        view.stopListening(view, 'close', this.destroyViewCallback);
        // Avoid circular close
        if (!view.isClose) {
            view.close();
        }
        return view;
    };
    View.prototype.sortModel = function ($container) {
        var _this = this;
        if ($container === void 0) { $container = null; }
        if (this.pendingViewModel.length || this.pendingViewModelPromise.length || this.isDispatch === false) {
            this.waitingForSort = true;
            return;
        }
        if (!($container instanceof $) || $container === null) {
            $container = this.$el.find(this.options.listSelector);
            if ($container.length === 0) {
                $container = this.$el.filter(this.options.listSelector);
                if ($container.length === 0) {
                    return;
                }
            }
        }
        // avoid lot of reflow and repaint.
        var displayCss = $container.css('display') || '';
        $container.css('display', 'none');
        _.each(this.collection.models, function (model) {
            var modelView = _this.referenceModelView[_this.options.listSelector][model.cid];
            $container.append(modelView.$el);
        });
        $container.css('display', displayCss);
    };
    View.prototype.updateCollection = function ($container) {
        var _this = this;
        if ($container === void 0) { $container = null; }
        if (this.pendingViewModelPromise.length) {
            if (this.updatePromise) {
                this.updatePromise.abort();
                this.updatePromise = null;
            }
            this.updatePromise = Promise.all(this.pendingViewModelPromise).then(function () {
                _this.updatePromise = null;
                _this.pendingViewModelPromise = [];
                _this._updateCollection($container);
            });
        }
        else {
            this._updateCollection($container);
        }
    };
    View.prototype._updateCollection = function ($container) {
        if ($container === void 0) { $container = null; }
        if (this.isDispatch === false) {
            this.waitingForUpdateCollection = true;
            return;
        }
        if ($container === null || !($container instanceof $)) {
            $container = this.$el.find(this.options.listSelector);
            if ($container.length === 0) {
                if (($container = this.$el.filter(this.options.listSelector)).length === 0) {
                    $container = $();
                }
            }
        }
        // avoid lot of reflow and repaint.
        var displayCss = $container.css('display') || '';
        $container.css('display', 'none');
        $container.append(this.pendingViewModel);
        this.pendingViewModel.splice(0, this.pendingViewModel.length);
        if (this.waitingForSort) {
            this.sortModel($container);
            this.waitingForSort = false;
        }
        $container.css('display', displayCss);
    };
    View.prototype.addView = function (selector, view) {
        var _this = this;
        var displayMode = this.$el.css('display') || ''; // Use css because some time show/hide use not expected display value
        this.$el.css('display', 'none'); // Don't display to avoid reflow
        var returnView;
        if (typeof selector !== 'string') {
            returnView = {};
            _.each(selector, function (viewList, selectorPath) {
                returnView[selectorPath] = _this._addView(selectorPath, viewList);
            });
        }
        else {
            returnView = this._addView(selector, view);
        }
        this.$el.css('display', displayMode);
        return returnView;
    };
    View.prototype._addView = function (selector, view, $el) {
        var _this = this;
        if ($el === void 0) { $el = this.$el; }
        if (!(selector in this.referenceModelView)) {
            this.referenceModelView[selector] = {};
        }
        var doAddView = function (viewToAdd) {
            _this.referenceModelView[selector][viewToAdd.cid] = viewToAdd;
            if (_this.isDispatch !== true && $el === _this.$el) {
                return;
            }
            var $container = $el.find(selector);
            if ($container.length === 0) {
                if (($container = $el.filter(selector)).length === 0) {
                    $container = $();
                }
            }
            $container.append(viewToAdd.$el);
            viewToAdd.stopListening(viewToAdd, 'close', _this.destroyViewCallback);
            viewToAdd.listenToOnce(viewToAdd, 'close', _this.destroyViewCallback);
            if (viewToAdd.isDispatch === false) {
                var $oldEl_1 = viewToAdd.$el;
                var newCreateView = viewToAdd.create();
                if (newCreateView instanceof Promise) {
                    return newCreateView.then(function ($renderNewCreate) {
                        // Replace node only if previous element has parent
                        // Avoid some conflict with render override in class which extend Ribs.View
                        if ($oldEl_1.parent().length > 0) {
                            $oldEl_1.replaceWith($renderNewCreate);
                        }
                        return $renderNewCreate;
                    });
                }
                else {
                    $oldEl_1.replaceWith(newCreateView);
                    return newCreateView;
                }
            }
            return viewToAdd.$el;
        };
        if (view instanceof Array) {
            return view.map(doAddView);
        }
        return doAddView(view);
    };
    View.prototype.onDestroySubView = function (view) {
        var _this = this;
        _.each(this.referenceModelView, function (modelViewCollection, selector) {
            _.each(modelViewCollection, function (modelView, cid) {
                if (modelView === view) {
                    delete _this.referenceModelView[selector][cid];
                    _this.onModelRemoved(modelView);
                }
            });
        });
    };
    View.prototype.prepareAddedView = function (modelView) {
        return modelView;
    };
    View.prototype.onInitialize = function () { };
    View.prototype.onInitializeStart = function () { };
    View.prototype.onRender = function () { };
    View.prototype.onRenderStart = function () { };
    View.prototype.onRenderAll = function () { };
    View.prototype.onModelAdded = function (modelViewAdded) { };
    View.prototype.onModelRemoved = function (modelViewRemoved) { };
    View.prototype.onClose = function () { };
    View.prototype.onCloseStart = function () { };
    View.defaultOptions = {
        removeModelOnClose: true,
        reRenderOnChange: false,
        listSelector: '.list',
        templateVariables: {},
        ModelView: null,
        ModelViewOptions: {},
        closeModelOnClose: true,
        closeCollectionOnClose: true,
        subviewAsyncRender: false
    };
    return View;
}(Backbone.View));
exports.View = View;
exports.default = View;
//# sourceMappingURL=view.js.map