
const CoCreateBase = require("./base");
const {ObjectID, Binary} = require("mongodb");

class CoCreateOrganization extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createOrg',		(socket, data, roomInfo) => this.createOrg(socket, data));
			this.wsManager.on('deleteOrg',		(socket, data, roomInfo) => this.deleteOrg(socket, data));
		}
	}

	async createOrg(socket, data) {
		const self = this;
		if(!data.data) return;
		
		try{
			const collection = this.getCollection(data);
			// create new org in config db organization collection
			collection.insertOne({ ...data.data, organization_id: data.organization_id }, function(error, result) {
				if(!error && result){
					const orgId = result.ops[0]._id + "";
					const anotherCollection = self.getDB(orgId).collection(data['collection']);
					// Create new org db and insert organization
					anotherCollection.insertOne({...result.ops[0], organization_id : orgId});
					
					const response  = { ...data, document_id: result.ops[0]._id, data: result.ops[0] }

					self.wsManager.send(socket, 'createOrg', response );
					if (data.room) {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'createDocument', response, true);
					} else {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'createDocument', response)	
					}
				}
			});
		}catch(error){
			console.log('createDocument error', error);
		}
	}
	
	
	async deleteOrg(socket, data) {
		const self = this;
		if(!data.data) return;
		
		try{
			const collection = this.getCollection(data);
			return;
			collection.insertOne(data.data, function(error, result) {
				if(!error && result){
					const orgId = result.ops[0]._id + "";
					const anotherCollection = self.getDB(orgId).collection(data['collection']);
					anotherCollection.insertOne(result.ops[0]);
					
					const response  = { ...data, document_id: result.ops[0]._id, data: result.ops[0]}

					self.wsManager.send(socket, 'createOrg', response);
					if (data.room) {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'createDocument', response, true);
					} else {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'createDocument', response)	
					}
				}
			});
		}catch(error){
			console.log('createDocument error', error);
		}
	}

}

module.exports = CoCreateOrganization;