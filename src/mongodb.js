const {ObjectId} = require("mongodb");
const {replaceArray} = require("./utils.crud.js")
const {searchData, sortData} = require("@cocreate/filter")



class CoCreateMongoDB {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('readDatabase',		(socket, data) => this.document(socket, data, 'readDatabase'))
			this.wsManager.on('createDocument',		(socket, data) => this.document(socket, data, 'createDocument'))
			this.wsManager.on('readDocument',		(socket, data) => this.document(socket, data, 'readDocument',))
			this.wsManager.on('updateDocument',		(socket, data) => this.document(socket, data, 'updateDocument'))
			this.wsManager.on('deleteDocument',		(socket, data) => this.document(socket, data, 'deleteDocument'))
			this.wsManager.on('createCollection',	(socket, data) => this.collection(socket, data, 'createCollection'))
			this.wsManager.on('readCollection',		(socket, data) => this.collection(socket, data, 'readCollection'))
			this.wsManager.on('updateCollection',	(socket, data) => this.collection(socket, data, 'updateCollection'))
			this.wsManager.on('deleteCollection',	(socket, data) => this.collection(socket, data, 'deleteCollection'))
			this.wsManager.on('readCollections',	(socket, data) => this.collection(socket, data, 'readCollection'))
		}
	}

	/** Create Document **/
	async database(socket, data, action){
		const self = this;
		// if(!data.data) return;

		try {
			if (action == 'readDatabase') {
				let db = this.dbClient.db().admin();

				// List all the available databases
				db.listDatabases(function(err, dbs) {
					if (dbs.databases.length > 0){
						console.log('dbs', dbs)
					}
					self.broadcast(socket, action, data)					
					// db.close();
				})
	
			}
		} catch(error) {
			self.wsManager.send(socket, 'ServerError', 'error');
			errorLog.push(error)
			data['error'] = errorLog
			console.log(action, 'error', error);
			self.wsManager.send(socket, action, data);
		}
	}

	async collection(socket, data, action){
		const self = this;
		let type = 'collection'
		let collectionArray = [];
		
		let errorLog = [];
		const errorHandler = (error) => {
			if (error) {
				error.db = 'mongodb'
				errorLog.push(error);
			}
		}

		try {
			if (data.request)
				data.collection = data.request

			let databases = data.database;  
			if (!Array.isArray(databases))
				databases = [databases]

			let databasesLength = databases.length
			for (let database of databases) {
				const db = this.dbClient.db(database);
				if (action == 'readCollection') {

					let {query, sort} = this.getFilters(data);

					db.listCollections(query).toArray(function(error, result) {
						if (error) {
							error.database = database
							errorHandler(error)
						}
						
						if (result)
							for (let res of result)
								collectionArray.push({name: res.name, database, db: 'mongodb'})

						databasesLength -= 1
						if (!databasesLength) {
							data = self.createData(data, collectionArray, type, errorLog)
							self.broadcast(socket, action, data)					
						}
					})		
				} else {
					let collections
					let value
					if (action == 'updateCollection')
						collections = Object.entries(data.collection)
					else
						collections = data.collection;				
					
					if (!Array.isArray(collections))
						collections = [collections]

					let collectionsLength = collections.length
					for (let collection of collections) {
						
						if (action == 'createCollection') {
							db.createCollection(collection, function(error, result) {
								if (error) {
									error.database = database
									error.collection = collection 
									errorHandler(error)
								}
								if (result)
									collectionArray.push({name: collection, database, db: 'mongodb'})

								collectionsLength -= 1           
								if (!collectionsLength)
									databasesLength -= 1
								
								if (!databasesLength && !collectionsLength) {
									data = self.createData(data, collectionArray, type, errorLog)
									self.broadcast(socket, action, data)					
								}
							})
						} else {
							if (action == 'updateCollection') {
								[collection, value] = collection
							}
	
							const collectionObj = db.collection(collection);

							if (action == 'updateCollection') {
								collectionObj.rename(value, function(error, result) {
									if (error) {
										error.database = database
										error.collection = collection 
										errorHandler(error)
									}
					
									if (result)
										collectionArray.push({name: value, oldName: collection, database, db: 'mongodb'})
									
									collectionsLength -= 1           
									if (!collectionsLength)
										databasesLength -= 1
									
									if (!databasesLength && !collectionsLength) {
										data = self.createData(data, collectionArray, type, errorLog)
										self.broadcast(socket, action, data)
									}

								})
							}

							if (action == 'deleteCollection') {
								collectionObj.drop( function(error, result) {
									if (error) {
										error.database = database
										error.collection = collection 
										errorHandler(error)
									}
									if (result)
										collectionArray.push({name: collection, database, db: 'mongodb'})
									
									collectionsLength -= 1           
									if (!collectionsLength)
										databasesLength -= 1
									
									if (!databasesLength && !collectionsLength) {
										data = self.createData(data, collectionArray, type, errorLog)
										self.broadcast(socket, action, data)
									}

								})
								
							}
						}

					}
				}
			}
		} catch(error) {
			errorLog.push(error)
			data['error'] = errorLog
			console.log(action, 'error', error);
			self.wsManager.send(socket, action, data);
		}


	}

	async document(socket, data, action){
		const self = this;

		let errorLog = [];
		const errorHandler = (error) => {
			if (error) {
				error.db = 'mongodb'
				errorLog.push(error);
			}
		}

		try {
			let type = 'document'
			let documents = [];

	        if (!data[type] && data.data)
            	data[type] = data.data

			if (data.request)
				data[type] = data.request


			if (!data['timeStamp'])
				data['timeStamp'] = new Date().toISOString()
	

			let isFilter
			if (data.filter && data.filter.query)
				isFilter = true
	
			let databases = data.database;  
			if (!Array.isArray(databases))
				databases = [databases]

			let databasesLength = databases.length
			for (let database of databases) {
				let collections = data.collection;
				if (!Array.isArray(collections))
					collections = [collections]

        		let collectionsLength = collections.length
				for (let collection of collections) {
					const db = this.dbClient.db(database);
					const collectionObj = db.collection(collection);
					
					let {query, sort} = this.getFilters(data);
					if (data['organization_id']) {
						query['organization_id'] = data['organization_id'];
					}

					let _ids = []
					let update_ids = []
					let updateData = {}

					if (data[type]) {
						if (!Array.isArray(data[type]))
							data[type] = [data[type]]
						for (let i = 0; i < data[type].length; i++) {
							data[type][i] = replaceArray(data[type][i])
							data[type][i]['organization_id'] = data['organization_id'];


							if (action == 'createDocument') {
								if (!data[type][i]._id)
									data[type][i]._id = ObjectId()
									data[type][i]['created'] = {on: data.timeStamp, by: data.user || data.clientId}

							}
							if (action == 'readDocument') {
								if (data[type][i]._id)
									_ids.push(data[type][i]._id)
							}
							if (action =='updateDocument') {
								if (data[type][i]._id)
									update_ids.push({_id: data[type][i]._id, updateDoc: data[type][i], updateType: '_id'})
							
								if (!data[type][i]._id)
									updateData = self.createUpdate({data: [data[type][i]]}, type)

								data[type][i]['modified'] = {on: data.timeStamp, by: data.user || data.clientId}

							}
							if (action =='deleteDocument') {
								if (data[type][i]._id) {
									_ids.push(data[type][i]._id)
									documents.push({_id: data[type][i]._id, db: 'mongodb', database, collection})
								}
							}
						}
						if (_ids.length == 1)
							query['_id'] = ObjectId(_ids[0])
						else if (_ids.length > 0)
							query['_id'] = {$in: _ids}
					}
					

					if (action == 'createDocument') {
						collectionObj.insertMany(data[type], function(error, result) {
							if (error) {
								error.database = database
								error.collection = collection 
								errorHandler(error)
							}
							
							documents.push(...data[type])

							collectionsLength -= 1           
							if (!collectionsLength)
								databasesLength -= 1
							
							if (!databasesLength && !collectionsLength) {
								data = self.createData(data, documents, type, errorLog)
								self.broadcast(socket, action, data)					
							}
						});	
					}

					if (action == 'readDocument') {

						collectionObj.find(query).sort(sort).toArray(function(error, result) {
							if (error) {
								error.database = database
								error.collection = collection 
								errorHandler(error)
							}
	
							if (result) {
								// ToDo: forEach at cursor, searchData can can be an object or an array to 1 or many docs
								let searchResult = searchData(result, data.filter)
								for (let doc of searchResult) {
									doc.db = 'mongodb'
									doc.database = database
									doc.collection = collection
									documents.push(doc)
								}

								if (data.returnDocument == false) {
									
									for (let item of data['data'])  {
										let resp = {};
										resp['_id'] = tmp['_id']
										data[type].forEach((f) => resp[f] = item[f])
										documents.push(resp);
									}
		
									data['data'] = documents
								}
							}

							collectionsLength -= 1           
							if (!collectionsLength)
								databasesLength -= 1
							
							if (!databasesLength && !collectionsLength) {
								data = self.createData(data, documents, type, errorLog)
								self.broadcast(socket, action, data)					
							}
						});
					}

					if (action == 'updateDocument' || action == 'deleteDocument') {
						const queryDocs = () => {
							return new Promise((resolve, reject) => {
						
								collectionObj.find(query).sort(sort).toArray(function(error, result) {
									if (error) {
										error.database = database
										error.collection = collection 
										errorHandler(error)
									}
					
									let searchResult = searchData(result, data.filter)
									resolve(searchResult)
								})
							}, (err) => {
								console.log(err);
							});
						}
					
						let Result, $update, update, projection;

						if (isFilter && data.returnDocument != false)
							if (action == 'deleteDocument' || action == 'updateDocument' && updateData.update)
								Result = await queryDocs()

						if (Result) {
							for (let doc of Result) {
								if (action == 'deleteDocument')
									documents.push({_id: doc._id, db: 'mongodb', database, collection})
								else
									doc['modified'] = {on: data.timeStamp, by: data.user || data.clientId}
	
								_ids.push(doc._id)
							}
							update_ids.push({updateType: 'filter'})
						}

						if (action == 'updateDocument') {
							let docsLength = update_ids.length
							for (let {updateDoc, updateType} of update_ids) {
								
								if (updateType == '_id') {
									let update_id = updateDoc._id
									query['_id'] = ObjectId(update_id)
									$update = self.createUpdate({data: [updateDoc]}, type)
									update = $update.update
									projection = $update.projection
									documents.push({_id: update_id, db: 'mongodb', database, collection, ...update['$set']})
								}
								if (updateType == 'filter') {
									query['_id'] = {$in: _ids}
									$update = updateData
									update = $update.update
									projection = $update.projection
									for (let _id of _ids)
										documents.push({_id, db: 'mongodb', database, collection, ...update['$set']})

								}

								update['$set']['organization_id'] = data.organization_id
								
								collectionObj.updateMany(query, update, {
									upsert: false,
									projection
								}).then((result) => {	
	
										
								}).catch((error) => {
									errorLog.push(error)
									console.log(action, 'error', error);
								}).finally((error) => {
									docsLength -= 1
									if (!docsLength)
										collectionsLength -= 1  

									if (!collectionsLength)
										databasesLength -= 1
									
									if (!databasesLength && !collectionsLength) {
										data = self.createData(data, documents, type, errorLog)
										self.broadcast(socket, action, data)					
									}
								})
							}

						}

						if (action == 'deleteDocument') {
							query['_id'] = {$in: _ids}
							collectionObj.deleteMany(query, function(error, result) {
								collectionsLength -= 1           
								if (!collectionsLength)
									databasesLength -= 1
								
								if (!databasesLength && !collectionsLength) {
									data = self.createData(data, documents, type, errorLog)
									self.broadcast(socket, action, data)					
								}
								
							})
						}

					}
					
				}
			}

		} catch(error) {
			errorLog.push(error)
			data['error'] = errorLog
			console.log(action, 'error', error);
			self.wsManager.send(socket, action, data);
		}
	}

	createUpdate(data, type) {
		let update = {}, projection = {};
		if  (data[type][0]) {
			update['$set'] = this.valueTypes(data[type][0])
			// update['$set']['organization_id'] = data['organization_id'];
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
		}

		return {update, projection}
	
	}
	
	createData(data, array, type, errorLog) {
		if (errorLog.length > 0)
			data['error'] = errorLog

		if (!data.request)
			data.request = data.data || data[type] || {}
	
		if (data.filter && data.filter.sort)
			data[type] = sortData(array, data.filter.sort)
		else
			data[type] = array
	
		if (type == 'document' || type == 'doc')
			data.data = data[type]
		
		if (data.returnLog){
			if (!data.log)
				data.log = []
			data.log.push(...data[type])
		}
	
		return data
	}


	getFilters(data) {
		let query = {}, sort = {}
		let filter = {
			query: [],
			sort: [],
			search: {
				value: [],
				type: "or"
			},
			startIndex: 0,
			...data.filter
		};

		query = this.createQuery(filter.query);
	

		if (filter.sort)
			filter.sort.forEach((order) => {
				sort[order.name] = order.type
			});
		
		return {query, sort}
	}

	// ToDo: create impved mongodb query to cover many cases
	createQuery(filters) {
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
					query[key]['$regex'] = item.value;
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
				case '$regex':
					query[key][item.operator] = item.value;
					break;
				case '$in':
					var in_values = [];
					item.value.forEach(function(v) {
						in_values.push(new RegExp(".*" + v + ".*", "i"));
					});
					
					query[key] = {$in : in_values }
					break;
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
			for (const [key, value] of Object.entries(data)) {
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
		this.wsManager.broadcast(socket, component, response);
		process.emit('changed-document', response)
	}

}

module.exports = CoCreateMongoDB;
