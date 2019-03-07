/// <reference types="jquery" />
import * as Backbone from 'backbone';
import * as Ribs from './ribs';
import Model from './model';
export interface ICollectionOptions extends Backbone.CollectionFetchOptions {
    adapter?: Ribs.Adapter.Adapter;
    comparator?: string | Function;
    reset?: boolean;
}
export declare class Collection extends Backbone.Collection<Model> {
    options: Ribs.ICollectionOptions;
    onInitialize: any;
    collectionSource: Collection;
    _isRange: boolean;
    _currentRange: number;
    _lengthRange: number;
    isCircularRange: boolean;
    protected isClose: boolean;
    adapter: Ribs.Adapter.Adapter;
    constructor(models?: any, options?: Ribs.ICollectionOptions);
    initialize(models: any, options: any): void;
    batchSave(): void;
    sync(...arg: any[]): JQueryXHR;
    getFilteredCollection(onlyDatas: any, notDatas: any): Ribs.Collection;
    getRange(start: any, length: any): Ribs.Collection;
    setIsCircularRange(isCircularRange: any): this;
    rangeNext(): this;
    rangeNextPage(): this;
    rangeGoTo(index: any, newLength: any): this;
    setRangeLength(length: any): this;
    private getFilteredModels;
    private getRangeOfCollection;
    private nextRange;
    close(): void;
    readonly length: any;
    protected _removeModels(models: any, options: any): any[];
}
export default Collection;
