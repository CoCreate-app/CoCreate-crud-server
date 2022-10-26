'use strict';

const mongodb = require('./mongodb');
const backup = require('./backup');

class CoCreateCrudServer {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init()
	}

    init() {
        new mongodb(this.wsManager, this.dbClient);
        new backup(this.wsManager, this.dbClient);
    }
}

module.exports = CoCreateCrudServer;