'use strict';

import * as Backbone from 'backbone';
import * as _ from 'underscore';

class CEventsManager {

    constructor() { }

    constants = {

        // router
        'ROUTER_PREROUTE': 'router:preRoute',
        'ROUTER_POSTROUTE': 'router:postRoute'

    };

}

export const EventsManager = _.extend(new CEventsManager(), Backbone.Events);

export default EventsManager;
