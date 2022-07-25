const {ObjectId} = require("mongodb");
const {replaceArray} = require("./utils.crud.js")


class CoCreateCrud {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createDocument', (socket, data, socketInfo) => this.createDocument(socket, data, socketInfo));
			this.wsManager.on('readDocument',	(socket, data, socketInfo) => this.readDocument(socket, data, socketInfo))
			this.wsManager.on('updateDocument', (socket, data, socketInfo) => this.updateDocument(socket, data, socketInfo))
			this.wsManager.on('deleteDocument', (socket, data, socketInfo) => this.deleteDocument(socket, data, socketInfo))
			this.wsManager.on('createCollection', (socket, data, socketInfo) => this.createCollection(socket, data, socketInfo));
			this.wsManager.on('updateCollection', (socket, data, socketInfo) => this.updateCollection(socket, data, socketInfo))
			this.wsManager.on('deleteCollection', (socket, data, socketInfo) => this.deleteCollection(socket, data, socketInfo))
		}
	}

	/** Create Document **/
	async createDocument(socket, req_data, socketInfo){
		const self = this;
		if(!req_data.data) return;

		try{
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			let insertData = replaceArray(req_data.data);
			insertData['organization_id'] = req_data['organization_id'];

			collection.insertOne(insertData, function(error, result) {
				if(!error && result){
					const response  = {...req_data, document_id: `${result.insertedId}`, data: insertData } 
					self.broadcast(socket, 'createDocument', response, socketInfo)	
				} else {
					self.wsManager.send(socket, 'ServerError', error, socketInfo);
				}
			});
		}catch(error){
			console.log('createDocument error', error);
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}
	
	/** Read Document **/
	async readDocument(socket, req_data, socketInfo) {
		if (!req_data['collection'] || req_data['collection'] == 'null' || typeof req_data['collection'] !== 'string') {
			this.wsManager.send(socket, 'ServerError', 'error', socketInfo);
			return;
		} 
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			
			const query = {
				"_id": new ObjectId(req_data["document_id"])
			};
			if (req_data['organization_id']) {
				query['organization_id'] = req_data['organization_id'];
			}
			
			collection.find(query).toArray(function(error, result) {
				if (!error && result && result.length > 0) {
					let tmp = result[0];
					if (req_data['exclude_fields']) {
						req_data['exclude_fields'].forEach(function(field) {
							delete tmp[field];
						})
					}
					
					if (req_data.data) {
						let resp = {};
						resp['_id'] = tmp['_id']
						req_data.data.forEach((f) => resp[f] = tmp[f])
						tmp = resp;
					}
					
					self.wsManager.send(socket, 'readDocument', { ...req_data, data: tmp }, socketInfo);
				} else {
					self.wsManager.send(socket, 'readDocument error', req_data, socketInfo);
				}
			});
		} catch (error) {
			console.log('readDocument error', error, req_data); 
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}

	/** Update Document **/
	async updateDocument(socket, req_data, socketInfo) {
		const self = this;
		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			let objId = new ObjectId();
			try {
				if (req_data["document_id"]) {
					objId = new ObjectId(req_data["document_id"]);
				}
			} catch (err) {
				console.log(err);
			}

			// let requestData = req_data
			if (req_data['data']['_id'])
			delete req_data['data']['_id']
			
			if(typeof req_data['data'] === 'object')
				req_data['set'] = req_data['data']
			
			if(Array.isArray(req_data['delete_fields'])) 
				req_data['unset'] = req_data['delete_fields'];


			const query = {"_id": objId };
			const update = {"$set": {}};
				
			if( req_data['set'] )	{
				let insertData = replaceArray(req_data['set']);

				for (const [key, value] of Object.entries(insertData)) {
					let val;
					let valueType = typeof value;
					switch(valueType) {
						case 'string':
							val = value
							break;
						case 'number':
							val = Number(value)
							break;
						case 'object':
							if (Array.isArray(value))
								val = new Array(...value)
							else
								val = new Object(value)
							break;
						default:
							val = value
					  }
					update.$set[key] = val
				}				
			}
			if( req_data['unset'] ) {
				let unsetData = replaceArray(req_data['unset']);
			
				update['$unset'] = unsetData.reduce((r, d) => {r[d] = ""; return r}, {});
			}
			update['$set']['organization_id'] = req_data['organization_id'];

			let projection = {}
			Object.keys(update['$set']).forEach(x => {
				projection[x] = 1
			})

			collection.findOneAndUpdate( query, update, {
					returnOriginal : false,
					upsert: req_data.upsert || false,
					projection: projection,
				}
			).then((result) => {
				let response_data = result.value || {};
				
				let response = { ...req_data, document_id: response_data._id, data: req_data['set'] };

				if(req_data['unset']) 
					response['delete_fields'] = req_data['unset'];
				
				self.broadcast(socket, 'updateDocument', response, socketInfo)
			}).catch((error) => {
				console.log('error', error)
				self.wsManager.send(socket, 'ServerError', error, socketInfo);
			});
			
		} catch (error) {
			console.log(error)
			self.wsManager.send(socket, 'updateDocumentError', error, socketInfo);
		}
	}
	
	/** Delete Document **/
	async deleteDocument(socket, req_data, socketInfo) {
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			const query = {
				"_id": new ObjectId(req_data["document_id"])
			};

			collection.deleteOne(query, function(error, result) {
				if (!error) {
					let response = { ...req_data }
					self.broadcast(socket, 'deleteDocument', response, socketInfo)
				} else {
					self.wsManager.send(socket, 'ServerError', error, socketInfo);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}

	/** Create Collection **/
	async createCollection(socket, req_data, socketInfo) {
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			db.createCollection(req_data.collection, function(error, result) {
				if (!error) {
					let response = { ...req_data }
					self.broadcast(socket, 'deleteDocument', response, socketInfo)
				} else {
					self.wsManager.send(socket, 'ServerError', error, socketInfo);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}

	/** Update Collection **/
	async updateCollection(socket, req_data, socketInfo) {
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			collection.rename(req_data.target, function(error, result) {
				if (!error) {
					let response = { ...req_data }
					self.broadcast(socket, 'deleteDocument', response, socketInfo)
				} else {
					self.wsManager.send(socket, 'ServerError', error, socketInfo);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}

	/** Delete Collection **/
	async deleteCollection(socket, req_data, socketInfo) {
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			collection.drop( function(error, result) {
				if (!error) {
					let response = { ...req_data }
					self.broadcast(socket, 'deleteDocument', response, socketInfo)
				} else {
					self.wsManager.send(socket, 'ServerError', error, socketInfo);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}
	
	broadcast(socket, component, response, socketInfo) {
		this.wsManager.broadcast(socket, response.namespace || response['organization_id'], response.room, component, response, socketInfo);
		process.emit('changed-document', response)
	}
}

module.exports = CoCreateCrud;
