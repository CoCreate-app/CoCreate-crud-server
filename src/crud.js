const {ObjectId} = require("mongodb");
const {replaceArray} = require("./utils.crud.js")
const {searchData, sortData} = require("@cocreate/filter")



class CoCreateCrud {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createDocument',   (socket, data) => this.createDocument(socket, data))
			this.wsManager.on('readDocument',     (socket, data) => this.readDocument(socket, data))
			this.wsManager.on('updateDocument',   (socket, data) => this.updateDocument(socket, data))
			this.wsManager.on('deleteDocument',   (socket, data) => this.deleteDocument(socket, data))
			this.wsManager.on('readDocuments', 	  (socket, data) => this.readDocuments(socket, data))
			this.wsManager.on('createCollection', (socket, data) => this.createCollection(socket, data))
			this.wsManager.on('updateCollection', (socket, data) => this.updateCollection(socket, data))
			this.wsManager.on('deleteCollection', (socket, data) => this.deleteCollection(socket, data))
			this.wsManager.on('readCollections',  (socket, data) => this.readCollections(socket, data))
		}
	}

	/** Create Document **/
	async createDocument(socket, data){
		const self = this;
		if(!data.data) return;

		try{
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			let insertData = replaceArray(data.data);
			insertData['organization_id'] = data['organization_id'];

			collection.insertOne(insertData, function(error, result) {
				if(!error && result){
					const response  = {...data, document_id: `${result.insertedId}`, data: insertData }
					response.data['_id'] = result.insertedId;
					self.broadcast(socket, 'createDocument', response)	
				} else {
					self.wsManager.send(socket, 'ServerError', error);
				}
			});
		}catch(error){
			console.log('createDocument error', error);
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}
	
	/** Read Document **/
	async readDocument(socket, data) {
		if (!data['collection'] || data['collection'] == 'null' || typeof data['collection'] !== 'string') {
			this.wsManager.send(socket, 'ServerError', 'error');
			return;
		} 
		const self = this;

		try {
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			
			const {query, sort} = this.getFilters(data);
			if (data['organization_id']) {
				query['organization_id'] = data['organization_id'];
			}
			
			collection.find(query).sort(sort).toArray(function(error, result) {
				if (!error && result && result.length > 0) {
					let tmp = result[0];
										
					// ToDo: returns values of defined names
					if (data.returnDocument == false && data.data) {
						let resp = {};
						resp['_id'] = tmp['_id']
						data.data.forEach((f) => resp[f] = tmp[f])
						tmp = resp;
					}
					data.data = tmp
					self.wsManager.send(socket, 'readDocument', data);
				} else {
					self.wsManager.send(socket, 'readDocument error', data);
				}
			});
		} catch (error) {
			console.log('readDocument error', error, data); 
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}

	/** Update Document **/
	async updateDocument(socket, data) {
		const self = this;
		try {			
			let {query, sort} = this.getFilters(data);
			if (data['data'] && data['data']['_id'])
				delete data['data']['_id']

			let update = {}, projection = {}, returnNewDocument = false;
			if  (data.data) {
				update['$set'] = this.valueTypes(data.data)
				update['$set']['organization_id'] = data['organization_id'];
				if (update['$set']['_id'])
					delete update['$set']['_id']
				Object.keys(update['$set']).forEach(x => {
					projection[x] = 1
				})
			}
			
				
			if( data['deleteName'] ) {
				update['$unset'] = replaceArray(data['deleteName']);
			}
			
			if( data['updateName'] ) {
				update['$rename'] = replaceArray(data['updateName'])
				for (const [key, value] of Object.entries(update['$rename'])) {
					if (/\.([0-9]*)/g.test(key) || /\[([0-9]*)\]/g.test(value)) {
						console.log('key is array', /\[([0-9]*)\]/g.test(value), /\.([0-9]*)/g.test(key))
					} else {
						let newValue = replaceArray({[value]: value})
						let oldkey = key;
						for (const [key] of Object.entries(newValue)) {
							update['$rename'][oldkey] = key
						}
					}
				}
				returnNewDocument == true
			}

			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			collection.findOneAndUpdate( query, update, {
					returnOriginal: false,
					returnNewDocument: returnNewDocument || false,
					upsert: data.upsert || false,
					projection: projection,
				}
			).then((result) => {
				if (result) {				
					update['$set']['_id'] = data.data._id || data.document_id
					data.data = update['$set']
					self.broadcast(socket, 'updateDocument', data)
				} else {
					self.wsManager.send(socket, 'ServerError', error);
				}
			}).catch((error) => {
				console.log('error', error)
				self.wsManager.send(socket, 'ServerError', error);
			});
			
		} catch (error) {
			console.log(error)
			self.wsManager.send(socket, 'updateDocumentError', error);
		}
	}
	
	/** Delete Document **/
	async deleteDocument(socket, data) {
		const self = this;

		try {
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			const query = {
				"_id": new ObjectId(data["document_id"])
			};

			collection.deleteOne(query, function(error, result) {
				if (!error) {
					self.broadcast(socket, 'deleteDocument', data)
				} else {
					self.wsManager.send(socket, 'ServerError', error);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}

	async readDocuments(socket, data) {		
		function sleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		}

		const self = this;
		
		try {
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			let {query, sort} = this.getFilters(data);
			collection.find(query).sort(sort).toArray(function(error, result) {
				if (result) {
					data['data'] = searchData(result, data.filter)
					self.wsManager.send(socket, 'readDocuments', data );
				} else {
					console.log(error)
					self.wsManager.send(socket, 'ServerError', error);
				}
			})
		} catch (error) {
			console.log('readDocuments error', error);
			this.wsManager.send(socket, 'ServerError', 'error');
		}
	}
	
	/** Create Collection **/
	async createCollection(socket, data) {
		const self = this;

		try {
			const db = this.dbClient.db(data['organization_id']);
			db.createCollection(data.collection, function(error, result) {
				if (!error) {
					self.broadcast(socket, 'createCollection', data)
				} else {
					self.wsManager.send(socket, 'ServerError', error);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}

	/** Update Collection **/
	async updateCollection(socket, data) {
		const self = this;

		try {
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			collection.rename(data.target, function(error, result) {
				if (!error) {
					self.broadcast(socket, 'updateCollection', data)
				} else {
					self.wsManager.send(socket, 'ServerError', error);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}

	/** Delete Collection **/
	async deleteCollection(socket, data) {
		const self = this;

		try {
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			collection.drop( function(error, result) {
				if (!error) {
					self.broadcast(socket, 'deleteCollection', data)
				} else {
					self.wsManager.send(socket, 'ServerError', error);
				}
			})
		} catch (error) {
			console.log(error);
			self.wsManager.send(socket, 'ServerError', 'error');
		}
	}
	
	async readCollections(socket, data) {
		try {
			const self = this;
			data['collection'] = 'collections'
			
			let {query, sort} = this.getFilters(data);
			const db = this.dbClient.db(data['organization_id']);
			db.listCollections(query).toArray(function(error, result) {
				if (!error && result && result.length > 0) {
					data.data = sortData(result, sort)
					self.wsManager.send(socket, 'readCollections', data);
				}
			})			
		} catch(error) {
			console.log('readCollections error', error); 
			this.wsManager.send(socket, 'ServerError', 'error');
		}
	}

	getFilters(data) {
		let query = {}, sort = {}
		data.filter = {
			query: [],
			sort: [],
			search: {
				value: [],
				type: "or"
			},
			startIndex: 0,
			...data.filter
		};
		if (data.filter) {

			query = this.createQuery(data['filter'].query);
			if (data["document_id"]) {
				query['_id'] = ObjectId(data["document_id"]);
			}
			if (data.filter.sort)
				data.filter.sort.forEach((order) => {
					sort[order.name] = order.type
				});
		}
		return {query, sort}
	}

	createQuery(filters, data) {
		let query = new Object();

		filters.forEach((item) => {
			if (!item.name) {
				return;
			}
			var key = item.name;
			if (!query[key]) {
				query[key] = {};
			}
			
			if (item.name == "_id") 
				item.value = ObjectId(item.value)
			
			switch (item.operator) {
				case '$contain':
					var in_values = [];
					item.value.forEach(function(v) {
						in_values.push(new RegExp(".*" + v + ".*", "i"));
					});
					
					query[key] = {$in : in_values }
					break;
					
				case '$range':
					if (item.value[0] !== null && item.value[1] !== null) {
						query[key] = {$gte: item.value[0], $lte: item.value[1]};
					} else if (item.value[0] !== null) {
						query[key] = {$gte: item.value[0]};
					} else if (item.value[1] !== null) {
						query[key] = {$lte: item.value[1]};
					}
					break;
					
				case '$eq':
				case '$ne':
				case '$lt':
				case '$lte':
				case '$gt':
				case '$gte':
					query[key][item.operator] = item.value[0] || item.value;
					break;
				case '$in':
				case '$nin':
					query[key][item.operator] = item.value;
					break;
				case '$geoWithin':
					try {
						let value = JSON.parse(item.value);
						if (item.type) {
							query[key]['$geoWithin'] = {
								[item.type]: value
							} 
						}
					} catch(e) {
						console.log('geowithin error');
					}
					break;
			}    
		})
	
		//. global search
		//. we have to set indexes in text fields ex: db.chart.createIndex({ "$**": "text" })
		// if (data['searchKey']) {
		//   query["$text"] = {$search: "\"Ni\""};
		// }
		return query;
	}

	valueTypes(data) {
		let object = {}
		if( typeof data === 'object' ) {
			// update['$set'] = {}
			for (const [key, value] of Object.entries(replaceArray(data))) {
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
				object[key] = val
			}	
			return object;
		}
	}

	broadcast(socket, component, response) {
		this.wsManager.broadcast(socket, response.namespace || response['organization_id'], response.room, component, response);
		process.emit('changed-document', response)
	}

}

module.exports = CoCreateCrud;
