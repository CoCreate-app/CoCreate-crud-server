const {ObjectID} = require("mongodb");
const {encodeObject, replaceArray} = require("./utils.crud.js")


class CoCreateCrud {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createDocument', (socket, data, roomInfo) => this.createDocument(socket, data, roomInfo));
			this.wsManager.on('readDocument',	(socket, data, roomInfo) => this.readDocument(socket, data, roomInfo))
			this.wsManager.on('updateDocument', (socket, data, roomInfo) => this.updateDocument(socket, data, roomInfo))
			this.wsManager.on('deleteDocument', (socket, data, roomInfo) => this.deleteDocument(socket, data, roomInfo))
		}
	}

	/** Create Document **/
	async createDocument(socket, req_data, roomInfo){
		const self = this;
		if(!req_data.data) return;
		
		try{
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			let insertData = replaceArray(req_data.data);

			collection.insertOne(insertData, function(error, result) {
				if(!error && result){
					const response  = {...req_data, document_id: result.ops[0]._id, data:result.ops[0] } 
					// let isFlat = req_data.isFlat == false ? false : true;
					// const response_data = isFlat ? encodeObject(response) : response;
					const response_data = response;
					self.broadcast('createDocument', socket, req_data, roomInfo)	
				} else {
					self.wsManager.send(socket, 'ServerError', error, null, roomInfo);
				}
			});
		}catch(error){
			console.log('createDocument error', error);
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}
	
	/** Read Document **/
	async readDocument(socket, req_data, roomInfo) {
		if (!req_data['collection'] || req_data['collection'] == 'null' || typeof req_data['collection'] !== 'string') {
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
			return;
		} 
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			
			const query = {
				"_id": new ObjectID(req_data["document_id"])
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
					
					let isFlat = req_data.isFlat == true ? true : false;
					self.wsManager.send(socket, 'readDocument', { ...req_data, data: isFlat ? encodeObject(tmp) : tmp }, req_data['organization_id'], roomInfo);
				} else {
					self.wsManager.send(socket, 'ServerError', error, null, roomInfo);
				}
			});
		} catch (error) {
			console.log('readDocument error', error); 
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}

	/** Update Document **/
	async updateDocument(socket, req_data, roomInfo) {
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			let objId = new ObjectID();
			try {
				if (req_data["document_id"]) {
					objId = new ObjectID(req_data["document_id"]);
				}
			} catch (err) {
				console.log(err);
			}
			const query = {"_id": objId };
			
			const update = {};
			
			
			if( req_data['set'] )   update['$set'] = replaceArray(req_data['set']);
			if( req_data['unset'] ) update['$unset'] = req_data['unset'].reduce((r, d) => {r[d] = ""; return r}, {});
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
	
				let isFlat = req_data.isFlat == true ? true : false;
				let response_data = result.value || {};
				
				let response = { ...req_data, document_id: response_data._id, data: isFlat ? encodeObject(response_data) : response_data };

				if(req_data['unset']) response['delete_fields'] = req_data['unset'];
				
				self.broadcast('updateDocument', socket, req_data, roomInfo)
			}).catch((error) => {
				self.wsManager.send(socket, 'ServerError', error, null, roomInfo);
			});
			
		} catch (error) {
			console.log(error)
			self.wsManager.send(socket, 'updateDocumentError', error, req_data['organization_id']);
		}
	}
	
	/** Delete Document **/
	async deleteDocument(socket, req_data, roomInfo) {
		const self = this;

		try {
			const db = this.dbClient.db(req_data['organization_id']);
			const collection = db.collection(req_data["collection"]);
			const query = {
				"_id": new ObjectID(req_data["document_id"])
			};

			collection.deleteOne(query, function(error, result) {
				if (!error) {
					let response = { ...req_data }
					self.broadcast('deleteDocument', socket, req_data, roomInfo)
				} else {
					self.wsManager.send(socket, 'ServerError', error, null, roomInfo);
				}
			})
		} catch (error) {
			console.log(error);
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}
	
	broadcast(component, socket, req_data, response, roomInfo) {
		if (req_data.broadcast_sender != false) {
			self.wsManager.send(socket, component, { ...response, element: req_data['element']}, req_data['organization_id'], roomInfo);
		}
			
		if (req_data.broadcast !== false) {
			if (req_data.room) {
				self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'] , req_data.room, component, response, true, roomInfo);
			} else {
				self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'], null, component, response, true, roomInfo)	
			}
		}
		process.emit('changed-document', response)
	}
}

module.exports = CoCreateCrud;
