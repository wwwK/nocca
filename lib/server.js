'use strict';

var $q = require('q');
var $http = require('http');
var $extend = require('extend');

module.exports = Server;

function Server (Nocca, newConnectionHandler) {

    this.server = $http.createServer(connectionHandler)
        .listen(Nocca.config.servers.proxy.port, function () {
            Nocca.logSuccess('Port:', Nocca.config.servers.proxy.port, '-- Proxy server');
        });

    function connectionHandler(req, res) {

        var deferred = $q.defer();

        Nocca.logDebug('|  Request: ' + req.url);

        flattenIncomingRequest(req)
            .then(function(flatReq) {

                var context = {
                    httpResponse: res,
                    request: flatReq,
                    // duplicate the options object to prevent manipulation of the main config
                    opts: $extend({}, Nocca.config)
                };

                deferred.resolve(context);

            });

        newConnectionHandler({
            promise : deferred.promise,
            response: res
        });
    }

}

function flattenIncomingRequest (req, options) {

    options = options || {};
    options.maxIncomingBodyLength = 1e6;

    var deferred = $q.defer();

    var flatReq = {
        url: req.url,
        method: req.method,
        path: req.path,
        headers: req.headers
    };

    req.on('data', function (data) {

        // add request body if not exists
        flatReq.body = flatReq.body || '';

        flatReq.body += data;

        // Too much POST data, kill the connection!
        if (flatReq.body.length > options.maxIncomingBodyLength) {

            req.connection.destroy();
            deferred.reject('Request body data size overflow. Not accepting request bodies larger than ' + (options.maxIncomingBodyLength) + ' bytes');

        }

    });

    req.on('end', function () {

        deferred.resolve(flatReq);

    });

    return deferred.promise;

}