'use strict';

const crud = require('./src/crud');
const list = require('./src/list');
const user = require('./src/user');
const organization = require('./src/organization.js');
const industry = require('./src/industry.js');
const backup = require('./src/backup');

module.exports.init = function(socket_server, db_client) {
    new crud(socket_server, db_client);
    new list(socket_server, db_client);
    new user(socket_server, db_client);
    new organization(socket_server, db_client);
    new industry(socket_server, db_client);
    new backup(socket_server, db_client);
}