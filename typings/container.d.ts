import * as Ribs from './ribs';
export interface IContainerOptions {
    insertMode?: string;
}
export declare module Container {
    /**
     *
     * dispatch the views of all the container or by a container selector
     *
     * @param {type} containerSelector
     * @param {type} options
     *
     * @returns Promise<void>
     */
    function dispatch(containerSelector?: string, options?: Ribs.IContainerOptions): Promise<any> | void;
    /**
     *
     * add a view to a container
     *
     * @param {type} containerSelector
     * @param {type} view
     * @returns {undefined}
     */
    function add(containerSelector: string, view: Ribs.View): void;
    /**
     *
     * remove a view from the list, for a given selector
     * just remove the view from the list, don't close it
     *
     * @param {type} containerSelector
     * @param {type} view
     *
     * @returns {undefined}
     */
    function remove(containerSelector: string, view: Ribs.View): void;
    /**
     *
     * clear the view for a given selector
     * closes the view and also removes it from the container views list
     *
     * @param {type} containerSelector
     *
     * @returns {undefined}
     */
    function clear(containerSelector: string): void;
}
export default Container;
