class CoCreateDatabases {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('readDatabases', (socket, data) => this.readDatabases(socket, data));
		}
	}

	/** Create Document **/
	async readDatabases(socket, req_data){
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
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}
	
	
	broadcast(socket, component, response) {
		this.wsManager.broadcast(socket, component, response);
		process.emit('changed-document', response)
	}
}

module.exports = CoCreateDatabases;
