'use strict';

module.exports = {};
module.exports.defaultRequestMatcher = defaultRequestMatcher;
module.exports.addRecording = addRecording;

var $q = require('q');

var recordings = {};

function addRecording (endpoint, requestKey, recordedResponse) {

    // ensure presence of endpoint
    recordings[endpoint] = recordings[endpoint] || {};
    
    recordings[endpoint][requestKey] = recordedResponse;
    
}

function defaultRequestMatcher (reqContext) {
    var d = $q.defer();

    if (typeof recordings[reqContext.endpoint.key] !== 'undefined' &&
        typeof recordings[reqContext.endpoint.key][reqContext.requestKey] !== 'undefined') {

        reqContext.playbackResponse = recordings[reqContext.endpoint.key][reqContext.requestKey];
        console.log('|    Found a matching record!');

    }
    else {
        // Probably no recording found, just return the context as is
        console.log('|    No matching record found');
    }

    d.resolve(reqContext);

    return d.promise;

}