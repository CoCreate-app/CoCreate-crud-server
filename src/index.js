'use strict';

const crud = require('./crud');
const list = require('./list');
const user = require('./user');
const unique = require('./unique');
const organization = require('./organization');
const industry = require('./industry');
const backup = require('./backup');

module.exports.init = function(socket_server, db_client) {
    new crud(socket_server, db_client);
    new list(socket_server, db_client);
    new user(socket_server, db_client);
    new unique(socket_server, db_client);
    new organization(socket_server, db_client);
    new industry(socket_server, db_client);
    new backup(socket_server, db_client);
}