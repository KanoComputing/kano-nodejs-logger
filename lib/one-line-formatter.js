'use strict';

const levelMap = {
    '10': {
        name: 'TRACE',
        color: 'grey'
    },
    '20': {
        name: 'DEBUG',
        color: 'blue'
    },
    '30': {
        name: 'INFO',
        color: 'cyan'
    },
    '40': {
        name: 'WARN',
        color: 'yellow'
    },
    '50': {
        name: 'ERROR',
        color: 'red'
    },
    '60': {
        name: 'FATAL',
        color: 'magenta'
    }
};

let stream = require('stream'),
    Writable = stream.Writable,
    colors = require('colors');

class OneLineFormatter extends Writable {
    constructor () {
        super(arguments);
    }
    _write (chunk, enc, callback) {
        var msg = JSON.parse(chunk),
            level = msg.level,
            time = msg.time,
            levelName = levelMap[level].name,
            levelColor = levelMap[level].color,
            msgString;

        ['level', 'name', 'hostname', 'pid', 'v', 'time'].forEach(function (key) {
            delete msg[key];
        });

        if (msg.msg) {
            msgString = colors[levelColor](msg.msg);
        } else if (msg.req) {
            msgString = msg.req;
        } else if (msg.res) {
            msgString = msg.res;
        } else {
            msgString = Object.keys(msg).map(function (key) {
                return key + '=' + msg[key];
            }).join(', ');
        }
        // Log in the console, with date, level and message using the right color
        console.log('[%s][%s] %s', time, colors[levelColor](levelName), msgString);
        callback();
    }
}

module.exports = OneLineFormatter;
