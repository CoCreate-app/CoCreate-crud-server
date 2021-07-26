
const CoCreateBase = require("./base");
const {ObjectID, Binary} = require("mongodb");

class CoCreateUser extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createUserNew',			(socket, data, roomInfo) => this.createUserNew(socket, data));
			this.wsManager.on('createUser',				(socket, data, roomInfo) => this.createUser(socket, data));
			this.wsManager.on('checkUnique',			(socket, data, roomInfo) => this.checkUnique(socket, data, roomInfo));
			this.wsManager.on('login',					(socket, data, roomInfo) => this.login(socket, data, roomInfo))
			this.wsManager.on('usersCurrentOrg',		(socket, data, roomInfo) => this.usersCurrentOrg(socket, data, roomInfo))
			this.wsManager.on('fetchUser',				(socket, data, roomInfo) => this.fetchUser(socket, data, roomInfo))
			this.wsManager.on('userStatus',				(socket, data, roomInfo) => this.setUserStatus(socket, data, roomInfo))
		}
	}

	
	async createOrgNew(socket, data) {
		const self = this;
		if(!data) return;
		const newOrg_id = data.newOrg_id;
		if (newOrg_id != data.organization_id) {
			try{
				const collection = this.db.collection(data);
				const query = {
					"_id": new ObjectID(data["organization_id"])
				};
			
				collection.find(query).toArray(function(error, result) {
					if(!error && result){
						const newOrgDb = self.getDB(newOrg_id).collection(data['collection']);
						// Create new user in config db users collection
						newOrgDb.insertOne({...result.ops[0], organization_id : newOrg_id}, function(error, result) {
							if(!error && result){
								const response  = { ...data, document_id: result.ops[0]._id, data: result.ops[0]}
								self.wsManager.send(socket, 'createOrgNew', response, data['organization_id']);
							}
						});
					}
				});
			}catch(error){
				console.log('createDocument error', error);
			}
		}
	}

	async createUser(socket, data) {
		const self = this;
		if(!data.data) return;
		
		try{
			const collection = this.getCollection(data);
			// Create new user in config db users collection
			collection.insertOne(data.data, function(error, result) {
				if(!error && result){
					const orgDB = data.orgDB;
					// if new orgDb Create new user in new org db users collection
					if (orgDB != data.organization_id) {
						if (orgDB) {
							const anotherCollection = self.getDB(orgDB).collection(data['collection']);
							anotherCollection.insertOne({...result.ops[0], organization_id : orgDB});
						}
					}
					const response  = { ...data, document_id: result.ops[0]._id, data: result.ops[0]}
					self.wsManager.send(socket, 'createUser', response, data['organization_id']);
				}
			});
		}catch(error){
			console.log('createDocument error', error);
		}
	}

	/**
		data = {
			namespace: string,	
			collection: string,
			request_id: string,
			name: string,
			value: any,
			
			apiKey: string,
			organization_id: string
		}
	**/
	async checkUnique(socket, req_data) {
		const securityRes = await this.checkSecurity(req_data)
		const self = this;
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}

		const collection = this.getDB(req_data['namespace']).collection(req_data["collection"]);
			
		const query = {
			[req_data['name']]: req_data['value']
		};
		
		if (securityRes['organization_id']) {
			query['organization_id'] = securityRes['organization_id'];
		}
		
		try {
			collection.find(query).toArray(function(error, result) {
				if (!error && result) {
					let response = {
						request_id: req_data['request_id'],
						name: req_data['name'],
						unique: false
					}
					if (result.length == 0) {
						response.unique = true;
					}
					self.wsManager.send(socket, 'checkedUnique', response, req_data['organization_id'])
				}
			})
		} catch (error) {
			console.log(error);
		}
	}
	
	/**
		data = {
			namespace:				string,	
			data-collection:	string,
			loginData:				object,
			eId:							string,
			form_id:					string,

			apiKey: string,
			organization_id: string
		}
	**/	
	async login(socket, req_data) {
		const securityRes = await this.checkSecurity(req_data);
		const self = this;
		if (!securityRes.result) {
			self.wsManager.send(socket, 'securityError', 'error', req_data['organization_id']);
			return;   
		}
		try {
			const {organization_id} = req_data
			const selectedDB = organization_id;
			const collection = self.getDB(selectedDB).collection(req_data["data-collection"]);
			const query = new Object();
			
			// query['connected_orgs'] = data['organization_id'];

			for (var key in req_data['loginData']) {
				query[key] = req_data['loginData'][key];
			}
			
			collection.find(query).toArray(async function(error, result) {
				let response = {
					eId: req_data['eId'],
					uid: req_data['uid'],
					form_id: req_data['form_id'],
					success: false,
					message: "Login failed",
					status: "failed"
				}
				if (!error && result && result.length > 0) {
					let token = null;
					if (self.wsManager.authInstance) {
						token = await self.wsManager.authInstance.generateToken({user_id: result[0]['_id']});
					}

					response = { ...response,  
						success: true,
						id: result[0]['_id'],
						// collection: collection,
						document_id: result[0]['_id'],
						current_org: result[0]['current_org'],
						message: "Login successful",
						status: "success",
						token
					};
				} 
				console.log('before socket', response);
				self.wsManager.send(socket, 'login', response, req_data['organization_id'])
				console.log('success socket', req_data['organization_id']);
			});
		} catch (error) {
			console.log('login failed', error);
		}
	}
	
	/**
		data = {
			namespace:				string,	
			data-collection:	string,
			user_id:					string,
			href: string
		}
	**/		
	async usersCurrentOrg(socket, req_data) {
		try {
			const self = this;
			const {organization_id, db} = req_data
			const selectedDB = db || organization_id;
			const collection = this.getDB(selectedDB).collection(req_data["data-collection"]);
			
			let query = new Object();
			
			query['_id'] = new ObjectID(req_data['user_id']);

			collection.find(query).toArray(function(error, result) {
			
				if (!error && result && result.length > 0) {
					
					if (result.length > 0) {
						let org_id = result[0]['current_org'];
						const orgCollection = self.getDB(selectedDB).collection('organizations');
						
						orgCollection.find({"_id": new ObjectID(org_id),}).toArray(function(err, res) {
							if (!err && res && res.length > 0) {
								self.wsManager.send(socket, 'usersCurrentOrg', {
									id: 				req_data['id'],
									uid:				req_data['uid'],
									success:			true,
									user_id:			result[0]['_id'],
									current_org:		result[0]['current_org'],
									apiKey: 			res[0]['apiKey'],
									adminUI_id: 		res[0]['adminUI_id'],
									builderUI_id:		res[0]['builderUI_id'],
									href: req_data['href']
								}, req_data['organization_id'])
							}
						});
					}
				} else {
					// socket.emit('loginResult', {
					//   form_id: data['form_id'],
					//   success: false
					// });
				}
			});
		} catch (error) {
			
		}
	}

	/**
		data = {
			namespace:				string,	
			data-collection:	string,
			user_id:					object,

			apiKey: string,
			organization_id: string
		}
	**/		
	async fetchUser(socket, req_data) {
		const self = this;
		const securityRes = await this.checkSecurity(req_data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', req_data['organization_id']);
			return;   
		}
		
		try {
			const {organization_id, db} = req_data
			const selectedDB = db || organization_id;
			const collection = self.getDB(selectedDB).collection(req_data['data-collection']);
			const user_id = req_data['user_id'];
			const query = {
				"_id": new ObjectID(user_id),
			}
			
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			collection.findOne(query, function(error, result) {
				if (!error) {
					self.wsManager.send(socket, 'fetchedUser', result, req_data['organization_id']);
				}
			})
		} catch (error) {
			console.log('fetchUser error')
		}
	}
	
	/**
	 * status: 'on/off/idle'
	 */
	async setUserStatus(socket, req_data, roomInfo) {
		const self = this;
		// const securityRes = await this.checkSecurity(data);
		// if (!securityRes.result) {
		// 	this.wsManager.send(socket, 'securityError', 'error');
		// 	return;   
		// }
		const {info, status} = req_data;

		const items = info.split('/');

		if (items[0] !== 'users') {
			return;
		}
		
		if (!items[1]) return;

		try {
			const {organization_id, db} = req_data
			const selectedDB = db || organization_id;
			const collection = self.getDB(selectedDB).collection('users');
			const user_id = items[1];
			const query = {
				"_id": new ObjectID(user_id),
			}
			collection.update(query, {$set: {status: status}}, function(err, res) {
				if (!err) {
					self.wsManager.broadcast(socket, '', null, 'changedUserStatus', 
					{
						user_id,
						status
					})
				}
			})
		} catch (error) {
			console.log('fetchUser error')
		}
	}
}

module.exports = CoCreateUser;