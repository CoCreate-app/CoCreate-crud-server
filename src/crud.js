
const {ObjectID, Binary} = require("mongodb");
const CoCreateBase = require("./base");
const {encodeObject, decodeObject, replaceArray} = require("./utils.crud.js")


class CoCreateCrud extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createDocument', 	(socket, data, roomInfo) => this.createDocument(socket, data, roomInfo));
			this.wsManager.on('readDocument',		(socket, data, roomInfo) => this.readDocument(socket, data, roomInfo))
			this.wsManager.on('updateDocument', 	(socket, data, roomInfo) => this.updateDocument(socket, data, roomInfo))
			this.wsManager.on('deleteDocument', 	(socket, data, roomInfo) => this.deleteDocument(socket, data, roomInfo))
		}
	}

/** Create Document **/ 
	/*
	that.wsManager.onMessage(socket, "createDocument", data, roomInfo)
	
	that.wsManager.onMessage(socket, "readDocument", data, roomInfo)
	
	that.wsManager.onMessage(socket, "updateDocument", data, roomInfo)
		Example:
		that.wsManager.onMessage(socket, "updateDocument", {
			namespace: '',
			room: '',
			broadcast: true/false,
			broadcast_sender: true/false,
			
			collection: "test123",
			document_id: "document_id",
			data:{
			
				name1:“hello”,
				name2: “hello1”
			},
			delete_fields:["name3", "name4"],
			element: “xxxx”,
			metaData: "xxxx"
			}, roomInfo)
			
	that.wsManager.onMessage(socket, "deleteDocument", data, roomInfo)
	*/

	/** Create Document **/
	// data param needs organization_id field added to pass security check
	async createDocument(socket, req_data, roomInfo){
		
		const self = this;
		if(!req_data.data) return;
		
		try{
			const collection = this.db.collection(req_data['collection']);
			let insertData = replaceArray(req_data.data);

			collection.insertOne(insertData, function(error, result) {
				if(!error && result){
					const response  = {...req_data, document_id: result.ops[0]._id, data:result.ops[0] }  
					if (req_data.broadcast_sender !== false) {
						self.wsManager.send(socket, 'createDocument', response, req_data['organization_id'], roomInfo);
					}

					if (req_data.broadcast !== false) {
						if (req_data.room) {
							self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'] , req_data.room, 'createDocument', response, true, roomInfo);
						} else {
							self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'], null, 'createDocument', response, false, roomInfo)	
						}
					}
					
					self.processCRUDEvent('createDocument', response);
					
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
			
			const collection = this.db.collection(req_data["collection"]);
			
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
					
					self.wsManager.send(socket, 'readDocument', { ...req_data, data: encodeObject(tmp)}, req_data['organization_id'], roomInfo);
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
			
			const collection = this.db.collection(req_data["collection"]);
			const query = {"_id": new ObjectID(req_data["document_id"]) };
			
			const update = {};
			if( req_data['set'] )   update['$set'] = replaceArray(req_data['set']);
			if( req_data['unset'] ) update['$unset'] = req_data['unset'].reduce((r, d) => {r[d] = ""; return r}, {});
	
			collection.findOneAndUpdate(
				query,
				update,
				{
					returnOriginal : false,
					upsert: req_data.upsert || false
				}
			).then((result) => {
	
				let response = { ...req_data, data: encodeObject(result.value || {}) };

				if(req_data['unset']) response['delete_fields'] = req_data['unset'];
				
				if (req_data.broadcast_sender != false) {
					self.wsManager.send(socket, 'updateDocument', { ...response, element: req_data['element']}, req_data['organization_id'], roomInfo);
				}
					
				if (req_data.broadcast !== false) {
					if (req_data.room) {
						self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'] , req_data.room, 'updateDocument', response, true, roomInfo);
					} else {
						self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'], null, 'updateDocument', response, false, roomInfo)	
					}
				}
				
				self.processCRUDEvent('updateDocument', response);
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
			const collection = this.db.collection(req_data["collection"]);
			const query = {
				"_id": new ObjectID(req_data["document_id"])
			};

			collection.deleteOne(query, function(error, result) {
				if (!error) {
					let response = { ...req_data }
					if (req_data.broadcast_sender !== false) {
						self.wsManager.send(socket, 'deleteDocument', { ...response, element: req_data['element']}, req_data['organization_id'], roomInfo);
					}
					if (req_data.broadcast !== false) {
						if (req_data.room) {
							self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'] , req_data.room, 'deleteDocument', response, true, roomInfo);
						} else {
							self.wsManager.broadcast(socket, req_data.namespace || req_data['organization_id'], null, 'deleteDocument', response, false, roomInfo)	
						}
					}
					self.processCRUDEvent('deleteDocument', response);
				} else {
					self.wsManager.send(socket, 'ServerError', error, null, roomInfo);
				}
			})
		} catch (error) {
			console.log(error);
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}
	
	processCRUDEvent(action, data) {
		process.emit('changed-document', data)
		// if (data.collection == 'permissions') {
		// 	process.emit('refresh-permission', data)
		// }
	}
}

module.exports = CoCreateCrud;



