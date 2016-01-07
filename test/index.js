'use strict';

let kanoLogger = require('../'),
    logger = kanoLogger.createLogger({
        name: 'Test',
        level: 'TRACE'
    });


logger.trace('I am an TRACE level message');
logger.debug('I am an DEBUG level message');
logger.info('I am an INFO level message');
logger.warn('I am an WARN level message');
logger.error('I am an ERROR level message');
logger.fatal('I am an FATAL level message');
