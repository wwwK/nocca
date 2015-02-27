'use strict';

var $crypto = require('crypto');

module.exports = {};
module.exports.statisticsExporter = statisticsExporter;
module.exports.statisticsProcessor = statisticsProcessor;

var stats = {
    responses: {},
    recorded: [],
    forwarded: [],
    replayed: [],
    endpoints: {}
};

function statisticsProcessor (reqContext) {

    // log hash for easier visualisation of uniqueness
    var sha1 = $crypto.createHash('sha1');
    var requestKeyHash = sha1.update(reqContext.requestKey).digest('base64');

    // only log the response once to prevent overwrites
    if (typeof stats.responses[requestKeyHash] === 'undefined') {

        stats.responses[requestKeyHash] = {
            hash: requestKeyHash,
            request: reqContext.request,
            proxiedRequest: reqContext.proxiedFlatRequest || null,
            response: reqContext.response,
            endpoint: reqContext.endpoint
        };

    }

    stats.endpoints[reqContext.endpoint.key] = stats.endpoints[reqContext.endpoint.key] || [];
    stats.endpoints[reqContext.endpoint.key].push(requestKeyHash);

    var flagString = '';
    flagString += reqContext.flagRecorded ? '1' : '0';
    flagString += reqContext.flagForwarded ? '1' : '0';
    flagString += reqContext.flagReplayed ? '1' : '0';

    // string is:
    // rec|fwd|rep
    switch (flagString) {
        case '110':
            // recorded and forwarded
            stats.recorded.push(requestKeyHash);

            break;
        case '010':
            // forwarded, not recorded
            stats.forwarded.push(requestKeyHash);
        break;
        case '001':
            // replayed
            stats.replayed.push(requestKeyHash);

            break;
    }

    return reqContext;
    
}

function statisticsExporter () {
    
    // export stats!
    return stats;

}