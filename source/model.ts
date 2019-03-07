'use strict';

import * as Backbone from 'backbone';
import * as $ from 'jquery';
import * as _ from 'underscore';
import * as Ribs from './ribs';
import { Collection } from './collection';

export interface IModelOptions extends Backbone.ModelFetchOptions {
    adapter?: Ribs.Adapter.Adapter;
    closeModelOnDestroy?: boolean;
}

export interface IModelAttributes {
    [attr: string]: any;
}

export class Model<TAttr extends IModelAttributes = any> extends Backbone.Model {

    public adapter: Ribs.Adapter.Adapter;
    protected isClose: Boolean;

    attributes: TAttr;
    collection: Collection;

    constructor(attributes: TAttr, options?) {
        super(attributes, options);
        if (this.options.adapter) {
            this.adapter = options.adapter;
        } else {
            this.adapter = new Ribs.Adapter.DefaultAdapter();
        }

        this.isClose = false;
    }

    initialize (attributes: TAttr, options) {

        var defaultOptions = {
            virtualAttributes: []
        };

        this.options = $.extend(defaultOptions, options || {});

        // on projection two way, get model of the action to avoid stackoverflow
        this.lastModelTriggered = null;

        this.on('destroy', this.onDestroy, this);

        // if onInitializeStart exists
        if (this.onInitializeStart) {

            // execute it now
            this.onInitializeStart();

        }

        // if onInitialize exists
        if (this.onInitialize) {

            // execute it now
            this.onInitialize();

        }

    }

    private onDestroy() {
        if (this.options.closeModelOnDestroy === false) {
            return;
        }
        this.close();
    }

    close() {
        this.off('destroy', this.onDestroy, this);

        this.clear({ silent: true });
        this.isClose = true;
        this.trigger('close:model', this)
        this.trigger('close', this)

        this.stopListening();
        this.trigger('destroy', this, this.collection, {});
    }

    sync(...arg: any[]): JQueryXHR {
        this.adapter.load();
        return super.sync.apply(this, arg);
    }

    get<K extends keyof TAttr>(attribute: K): TAttr[K] {

        if (typeof (<any>this)[attribute] === 'function') {

            return (<any>this)[attribute]();

        } else {

            return Backbone.Model.prototype.get.call(this, attribute);

        }

    }

    set(obj: Partial<TAttr>, options?: Backbone.ModelSetOptions): Backbone.Model;
    set<K extends keyof TAttr>(attribute: K, value: TAttr[K]): Backbone.Model;
    set<K extends keyof TAttr>(attributeOrObj: any, valueOrOptions: any): Backbone.Model {
        return super.set(attributeOrObj, valueOrOptions);
    }

    toJSON() {

        var attributes = Backbone.Model.prototype.toJSON.call(this);

        if (_.has(this.options, 'virtualAttributes')) {

            _.each(this.options.virtualAttributes, (virtualAttribute) => {

                if (_.has(virtualAttribute, 'key')) {

                    var virtualAttributeKey = (<any>virtualAttribute).key;

                    if (_.isFunction(this[virtualAttributeKey])) {

                        attributes[virtualAttributeKey] = this[virtualAttributeKey].call(this);

                    } else {

                        throw 'virtual attribute function missing';

                    }

                } else {

                    throw 'virtual attribute "key" missing';

                }

            });

        }

        return attributes;

    }

    /**
     * Get a projection of the model. The model return will be sync with this current model.
     * @param modelClass Class of model projection.
     * @param keepAlive If true, when this model will be destroy, the projection will not be destroyed.
     * @param twoWay If true, this model will be sync with its own attribute. So if a projection change one of these attributes, this model will be affected.
     **/
    getModelProjection(modelClass: typeof Model = Model, keepAlive: boolean = false, twoWay: boolean = false) {

        var model = new modelClass(this.attributes);

        model.id = model.cid;//we do that to avoid same model with same id of the model (as long as Collection doesn't accept two model with same id)

        let selfChangeCallback = () => {

            // No trigger on the model of the action in two way
            if (this.lastModelTriggered === model) {
                return;
            }

            model.set(this.changed as any as Partial<TAttr>);

        };

        this.listenTo(this, 'change', selfChangeCallback);
        model.listenTo(model, 'close:model', () => {
            this.stopListening(this, 'change', selfChangeCallback);
        });


        if (twoWay === true) {

            let remoteChangeCallback = () => {

                var newValue = {};

                _.each(model.changed, (function (value, key) {

                    if (key in this.attributes) {

                        newValue[key] = value;

                    }

                }).bind(this))

                this.lastModelTriggered = model;

                this.set(newValue);

                this.lastModelTriggered = null;

            };

            this.listenTo(model, 'change', remoteChangeCallback);
            model.listenTo(model, 'close:model', () => {
                this.stopListening(model, 'change', remoteChangeCallback);
            })

        }

        if (keepAlive !== true) {

            let selfDestroyCallback = () => {

                model.destroy();

            };
            this.listenTo(this, 'destroy', selfDestroyCallback);
            model.listenTo(model, 'close:model', () => {
                this.stopListening(this, 'destroy', selfDestroyCallback);
            });
        }

        if (!this.modelSource) {

            model.modelSource = this;

        } else {

            model.modelSource = this.modelSource;

        }

        return model;

    }

    modelSource: Model;
    lastModelTriggered: Model;
    options: any;
    onInitialize;
    onInitializeStart;

};

export default Model;
