import * as Backbone from 'backbone';
export declare class Controller {
    options: any;
    router: Backbone.Router;
    configuration: any;
    _promise: any;
    promise: any;
    clear(): void;
    constructor(options: any, configuration: any, router: any);
    initialize(options: any, configuration: any, router: any): void;
    protected onInitialize(options: any, configuration: any, router: any): void;
    protected create(skeleton: any): PromiseLike<any>;
    static extend(): any;
}
export default Controller;
