'use strict';

const crud = require('./crud');
const backup = require('./backup');
const database = require('./database');

class CoCreateCrudServer {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init()
	}

    init() {
        new crud(this.wsManager, this.dbClient);
        new backup(this.wsManager, this.dbClient);
        new database(this.wsManager, this.dbClient);
    }
}

module.exports = CoCreateCrudServer;