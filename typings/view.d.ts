/// <reference types="jquery" />
/// <reference types="velocity-animate" />
import * as Backbone from 'backbone';
import * as FSPromise from 'FSPromise';
import Promise = FSPromise.FSPromise;
import { Collection } from './collection';
import Model from './model';
export interface IViewOptions extends Backbone.ViewOptions<Model> {
    /**
     * If true, remove model from its collection on view close
     **/
    removeModelOnClose?: boolean;
    reRenderOnChange?: boolean;
    listSelector?: string;
    templateVariables?: Object;
    ModelView?: typeof View;
    ModelViewOptions?: IViewOptions;
    collection?: Collection;
    subviewAsyncRender?: boolean;
    closeModelOnClose?: boolean;
    closeCollectionOnClose?: boolean;
    [extra: string]: any;
}
export interface IViewReference {
    $html: JQuery;
    container: Backbone.View<Backbone.Model>;
}
export declare class View extends Backbone.View<Model> {
    static defaultOptions: IViewOptions;
    options: IViewOptions;
    referenceModelView: {
        [selector: string]: {
            [cid: string]: View;
        };
    };
    isDispatch: boolean;
    template: any;
    private pendingViewModel;
    pendingViewModelPromise: Promise<JQuery>[];
    private waitingForSort;
    private waitingForUpdateCollection;
    protected updatePromise: Promise<any>;
    private isCollectionRendered;
    private isSubviewRendered;
    private $previousEl;
    private lastRenderPromise;
    private isCreating;
    private createPromise;
    protected isClose: Boolean;
    private removeModelCallback;
    private destroyViewCallback;
    collection: Collection;
    constructor(options?: any);
    initialize(options: any): void;
    render(): View | Promise<View>;
    reRenderModelView(): View | FSPromise.FSPromise<View>;
    private htmlizeView;
    htmlize(): JQuery | Promise<JQuery>;
    getModelAsJson(): any;
    getCollectionAsJson(): any;
    close(): void;
    create(): JQuery | Promise<JQuery>;
    clear(): void;
    empty(): void;
    reset(collection: any): void;
    removeUnusedModelView(collection: any): void;
    private addModel;
    protected formatModelViewOptions(modelViewOptions: any): IViewOptions;
    private removeModel;
    private sortModel;
    private updateCollection;
    private _updateCollection;
    addView(selector: string | {
        [selector: string]: View | View[];
    }, view: View | View[]): any;
    private _addView;
    private onDestroySubView;
    protected prepareAddedView(modelView: View): View;
    protected onInitialize(): void;
    protected onInitializeStart(): void;
    protected onRender(): void;
    protected onRenderStart(): void;
    protected onRenderAll(): void;
    protected onModelAdded(modelViewAdded: View): void;
    protected onModelRemoved(modelViewRemoved: View): void;
    protected onClose(): void;
    protected onCloseStart(): void;
}
export default View;
