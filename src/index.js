'use strict';

const {ObjectId, searchData, sortData} = require("@cocreate/utils");

class CoCreateCrudServer {
	constructor(wsManager, databases) {
		this.wsManager = wsManager
		this.databases = databases
		this.databaseUrls = new Map()
		this.ObjectId = ObjectId
		this.init();
	}
		
	init() {
		if (this.wsManager) {
			this.wsManager.on('createDatabase',		(socket, data) => this.db(socket, 'createDatabase', data))
			this.wsManager.on('readDatabase',		(socket, data) => this.db(socket, 'readDatabase', data))
			this.wsManager.on('updateDatabase',		(socket, data) => this.db(socket, 'updateDatabase', data))
			this.wsManager.on('deleteDatabase',		(socket, data) => this.db(socket, 'deleteDatabase', data))
			this.wsManager.on('createCollection',	(socket, data) => this.db(socket, 'createCollection', data))
			this.wsManager.on('readCollection',		(socket, data) => this.db(socket, 'readCollection', data))
			this.wsManager.on('updateCollection',	(socket, data) => this.db(socket, 'updateCollection', data))
			this.wsManager.on('deleteCollection',	(socket, data) => this.db(socket, 'deleteCollection', data))
			this.wsManager.on('createDocument',		(socket, data) => this.db(socket, 'createDocument', data))
			this.wsManager.on('readDocument',		(socket, data) => this.db(socket, 'readDocument', data))
			this.wsManager.on('updateDocument',		(socket, data) => this.db(socket, 'updateDocument', data))
			this.wsManager.on('deleteDocument',		(socket, data) => this.db(socket, 'deleteDocument', data))
		}
	}

	async databaseStats(data) {
		data = await this.db('', 'databaseStats', data)
		return data
	}

	async createDatabase(data) {
		data = await this.db('', 'createDatabase', data)
		return data
	}

	async readDatabase(data) {
		data = await this.db('', 'readDatabase', data)
		return data
	}
	
	async updateDatabase(data) {
		data = await this.db('', 'updateDatabase', data)
		return data
	}

	async deleteDatabase(data) {
		data = await this.db('', 'deleteDatabase', data)
		return data
	}

	async createCollection(data) {
		data = await this.db('', 'createCollection', data)
		return data
	}

	async readCollection(data) {
		data = await this.db('', 'readCollection', data)
		return data
	}
	
	async updateCollection(data) {
		data = await this.db('', 'updateCollection', data)
		return data
	}

	async deleteCollection(data) {
		data = await this.db('', 'deleteCollection', data)
		return data
	}

	async createDocument(data) {
		data = await this.db('', 'createDocument', data)
		return data
	}
	
	async readDocument(data) {
		data = await this.db('', 'readDocument', data)
		return data
	}

	async updateDocument(data) {      
		data = await this.db('', 'updateDocument', data)
		return data
	}

	async deleteDocument(data) {
		data = await this.db('', 'deleteDocument', data)
		return data
	}

	async db(socket, action, data) {
		return new Promise(async (resolve) => {
			try {
				if (!data.organization_id)
					resolve()

				let dbs = this.databaseUrls.get(data.organization_id)
				if (dbs == 'false')
					resolve()

				if (!dbs) {
					let organization = await this.databases['mongodb']['readDocument']({
						database: process.env.organization_id,
						collection: 'organizations',
						document: [{_id: data.organization_id}],
						organization_id: process.env.organization_id
					})
					if (organization && organization.document && organization.document[0])
						organization = organization.document[0]
					if (organization && organization.dbs) {
						dbs = organization.dbs
						this.databaseUrls.set(data.organization_id, dbs)
						console.log('organization or dbs urls could not be found')
					} else {
						this.databaseUrls.set(data.organization_id, 'false')
						console.log('organization or dbs urls could not be found')
						resolve()
					}
				}
		
				if (!data['timeStamp'])
					data['timeStamp'] = new Date().toISOString()

                if (action == 'updateDocument' && data.upsert != false)
                    data.upsert = true
				
				// ToDo: support stats from multiple dbs 
                if (data.collection || action == 'databaseStats') {
                    if (!data.database)
                        data['database'] = data.organization_id
                }

				if (!data.db || !data.db.length)
					data.db = ['mongodb']
				let dbsLength = data.db.length
				for (let i = 0; i < data.db.length; i++) {
					dbsLength -= 1
					if (this.databases[data.db[i]]) {
						// ToDo: for loop on each dbs url					
						if (dbs && dbs[data.db[i]])
							data['dbs'] = dbs[data.db[i]][0]
	
						this.databases[data.db[i]][action](data).then((data) => {
							//ToDo: sorting should take place here in order to return sorted values from multiple dbs
							if (!dbsLength) {
								if (socket) {
									this.wsManager.broadcast(socket, action, data);
									process.emit('changed-document', data)
									resolve()
								} else {
									resolve(data)
								}
							}
						})
					} else {
						if (!dbsLength) {
							if (socket) {
								this.wsManager.broadcast(socket, action, data);
								process.emit('changed-document', data)
								resolve()
							} else {
								resolve(data)
							}
						}
					}
				}
			} catch(error) {
				if (socket) {
					errorHandler(data, error)
					this.wsManager.send(socket, action, data);
					resolve()
				} else {
					resolve(data)
				}
			}
		});
	}

	errorHandler(data, error, database, collection){
		if (typeof error == 'object')
			error['db'] = 'mongodb'
		else
			error = {location: 'crudServer', message: error}
		
		if (database)
			error['database'] = database
		
		if (data.error)
			data.error.push(error)
		else
			data.error = [error]
	}
}

module.exports = CoCreateCrudServer;