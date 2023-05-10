'use strict';

const {ObjectId, searchData, sortData} = require("@cocreate/utils");

class CoCreateCrudServer {
	constructor(wsManager, databases, database) {
		this.wsManager = wsManager
		this.databases = databases
		this.database = database
		this.ObjectId = ObjectId
		this.databaseUrls = new Map();
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
					return resolve()

				let dbUrl = this.databaseUrls.get(data.organization_id)
				if (dbUrl === false)
					return resolve({dbUrl: false, error: 'database url could not be found'})

				if (!dbUrl) {
					if (data.organization_id === process.env.organization_id) {
						dbUrl = { [this.database.name]: this.database}
						this.databaseUrls.set(data.organization_id, dbUrl)
					} else {
						let organization = await this.databases[this.database.name]['readDocument']({
							dbUrl: this.database.url[0],
							database: process.env.organization_id,
							collection: 'organizations',
							document: [{_id: data.organization_id}],
							organization_id: process.env.organization_id
						})
						if (organization && organization.document && organization.document[0])
							organization = organization.document[0]
						if (organization && organization.databases) {
							dbUrl = organization.databases
							this.databaseUrls.set(data.organization_id, dbUrl)
						} else {
							this.databaseUrls.set(data.organization_id, false)
							if (organization)
								return resolve({dbUrl: false, error: 'database url could not be found'})
							else
								return resolve({organization: false, error: 'organization could not be found'})
						}
					}
				}
		
				if (!data['timeStamp'])
					data['timeStamp'] = new Date().toISOString()

                if (action == 'updateDocument' && data.upsert != false)
                    data.upsert = true
				
				// ToDo: support stats from multiple dbs 
                if (data.collection || action === 'databaseStats') {
                    if (!data.database)
                        data['database'] = data.organization_id
					
					if (action === 'updateDocument' && data.organization_id !== process.env.organization_id) {
						let syncKeys
						if (data.collection === 'organizations')
							syncKeys = ['name', 'logo', 'databases', 'hosts', 'apis']
						else if (data.collection === 'users')
							syncKeys = ['name', 'email', 'password', 'avatar']

						if (syncKeys && syncKeys.length) {
							let platformUpdate = {
								dbUrl: this.database.url,
								database: process.env.organization_id,
								collection: data.collection,
								document: [{}],
								organization_id: process.env.organization_id
							}

							let document = data.document[0] || data.document
							if (document) {
								for (let key of syncKeys) {
									if (document[key])
										platformUpdate.document[0][key] = document[key]
								}
							}

							this.databases[this.database.name][action](platformUpdate)
						}

					}
					
                }

				if (!data.db || !data.db.length)
					data.db = ['mongodb']

				for (let i = 0; i < data.db.length; i++) {
					if (dbUrl && dbUrl[data.db[i]]) {
						let db = dbUrl[data.db[i]]

						if (db.name && this.databases[db.name]) {

							for (let i = 0; i < db.url.length; i++) {
								data['dbUrl'] = db.url[i]
								data = await this.databases[db.name][action](data)
							}				
	
							//ToDo: sorting should take place here in order to return sorted values from multiple dbs
						}
					}
				}
					
				delete data.dbUrl
				if (socket) {
					this.wsManager.broadcast(socket, action, data);
					process.emit('changed-document', data)
					resolve()
				} else {
					resolve(data)
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