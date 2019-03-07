import * as Backbone from 'backbone';
export declare class Router extends Backbone.Router {
    constructor(options?: Backbone.RouterOptions);
    initialize(): void;
    routes: {};
    route(route: string | RegExp, name: string, callback: Function): this;
    execute(callback: Function, routeArguments: Array<any>, routeName: string, internalCallback?: Function): boolean;
    getCurrentRoute(): any;
}
export default Router;
