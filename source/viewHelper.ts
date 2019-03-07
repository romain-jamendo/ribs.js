'use strict';

export module ViewHelper {
	
    var viewHelpers = {};
    
    export function add (helperName, helperCallback) {
        
        viewHelpers[helperName] = helperCallback;
        
    }
    
    export function remove (helperName) {
        
        delete viewHelpers[helperName];
        
    };
    
    export function get () {
        
        return viewHelpers;
        
    };

}

export default ViewHelper;
