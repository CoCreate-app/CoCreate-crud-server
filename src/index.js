'use strict';

const crud = require('./crud');
const list = require('./list');
const backup = require('./backup');

module.exports.init = function(wsManager, dbClient) {
    new crud(wsManager, dbClient);
    new list(wsManager, dbClient);
    new backup(wsManager, dbClient);
}