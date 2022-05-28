const {ObjectId} = require("mongodb");
const {encodeObject, replaceArray} = require("./utils.crud.js")


class CoCreateDatabases {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('readDatabases', (socket, data, socketInfo) => this.readDatabases(socket, data, socketInfo));
		}
		// this.readDatabases()
	}

	/** Create Document **/
	async readDatabases(socket, req_data, socketInfo){
		const self = this;
		// if(!req_data.data) return;

		try {
			var db = this.dbClient.db().admin();

			// List all the available databases
			db.listDatabases(function(err, dbs) {
				if (dbs.databases.length > 0){
					console.log('dbs', dbs)
				}

				// db.close();
			})
		} catch(error) {
			console.log('readDatabases error', error);
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}
	
	
	broadcast(socket, component, response, socketInfo) {
		this.wsManager.broadcast(socket, response.namespace || response['organization_id'], response.room, component, response, socketInfo);
		process.emit('changed-document', response)
	}
}

module.exports = CoCreateDatabases;
