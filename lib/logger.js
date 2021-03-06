'use strict';

let bunyan              = require('bunyan'),
    Buffer              = require('buffer').Buffer,
    buffer              = new Buffer(16),
    uuid                = require('uuid'),
    extend              = require('deep-extend'),
    util                = require('util'),
    OneLineFormatter    = require('./one-line-formatter'),
    formatOut,
    serializers,
    KanoLogger;


function generateId() {
    let id = uuid.v4({}, buffer);
    return id.toString('hex');
}

function isObject(x) {
    return typeof (x) === 'object' && x !== null;
}

// Custom formatter for requests and responses
serializers = {
    req (req) {
        return {
            toJSON: function () {
                if (!isObject(req)) {
                    return req;
                }
                return util.format(
                        'REQ #%s - [%s] ---  - %s - %s',
                        req.id,
                        req.method.toUpperCase(),
                        req.url,
                        req.body ? JSON.stringify(req.body) : ''
                    );
            }
        };
    },
    res (res) {
        return {
            toJSON: function () {
                if (!isObject(res)) {
                    return res;
                }
                return util.format(
                    'RES #%s - [%s][%s] - %s (%s ms)',
                    res.req.id,
                    res.req.method.toUpperCase(),
                    res.statusCode,
                    res.req.url,
                    res.duration
                );
            }
        };
    }
};

formatOut = new OneLineFormatter();

module.exports = KanoLogger = {
    createLogger (opts) {
        return bunyan.createLogger({
            name: opts.name,
            serializers: serializers,
            stream: formatOut,
            level: opts.level || 'INFO'
        });
    },
    getMiddleware (logger) {
        return function loggerMiddleware(req, res, next) {
            let bodyOutput = extend({}, req.body || {}),
                start = Date.now(),
                reqClone;

            req.id = req.id || generateId();

            reqClone = {
                id: req.id,
                method: req.method,
                url: req.url
            };

            if (req.body && Object.keys(req.body).length) {

                ['password', 'old_password', 'new_password'].forEach(function (key) {
                    if (bodyOutput[key]) {
                        bodyOutput[key] = 'xxxxxxxx';
                    }
                });
                reqClone.body = bodyOutput;
            }

            // Only log the relevant info with the protected body
            logger.info({ req: reqClone });

            res.once('finish', function () {
                res.duration = Date.now() - start;
                logger.info({ res: res });
            });

            next();
        };
    }
};
