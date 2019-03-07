'use strict';

import * as Backbone from 'backbone';
import * as _ from 'underscore';

export class Controller {

    options: any;
    router: Backbone.Router;
	configuration: any;
    _promise;

    get promise() {
        return this._promise;
    }

    set promise(value) {
        this._promise = value;
    }

    clear(): void { }

    constructor(options, configuration, router) {

		this.options = options || {};
        this.router = router || new Backbone.Router();
        this.configuration = configuration || {};
	
        this.initialize(options, configuration, router);
		
        _.extend(this, Backbone.Events);

    }

    initialize(options, configuration, router) {

        // execute it now
        this.onInitialize(this.options, configuration, this.router);

    }

    protected onInitialize(options, configuration, router) {

    }

    protected create(skeleton: any): PromiseLike<any> {
        return null;
    }


    static extend() {
        return (<any>Backbone.Model).extend.apply(this, arguments);
    }

}

export default Controller;
