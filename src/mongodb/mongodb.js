const {MongoClient, ObjectId} = require('mongodb');
const {dotNotationToObject, searchData, sortData} = require('@cocreate/utils')

function mongoClient(dbUrl) {
	try {
		dbUrl = "mongodb+srv://cocreate-app:rolling123@cocreatedb.dnjr1.mongodb.net" || dbUrl || process.env.MONGO_URL || config.db_url;
		if (!dbUrl || !dbUrl.includes('mongodb'))
			console.log('CoCreate.config.js missing dbUrl')
		dbClient = MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
		return dbClient;
	} catch (error) {
		console.error(error)
		return {
			status: false
		}
	}
}

let dbClient;
mongoClient().then(Client => {
	dbClient = Client
});

async function databaseStats(data) {
	let stats = await dbClient.db(data.organization_id).stats()
	return stats
}

function createDatabase(data) {
	return database('createDatabase', data)
}

function readDatabase(data) {
	return database('readDatabase', data)
}

function updateDatabase(data) {
	return database('updateDatabase', data)
}

function deleteDatabase(data) {
	return database('deleteDatabase', data)
}

function database(action, data){
	return new Promise((resolve, reject) => {
		const self = this;

		try {
			if (action == 'readDatabase') {
				let db = dbClient.db().admin();

				// List all the available databases
				db.listDatabases(function(err, dbs) {
					resolve({...data, database: dbs.databases})					
				})
	
			}
			if (action == 'deleteDatabase') {
				const db = dbClient.db(data.database);
				db.dropDatabase().then(response => {
					resolve(response)
				})
			}
		} catch(error) {
			errorLog.push(error)
			data['error'] = errorLog
			console.log(action, 'error', error);
			resolve(data);
		}

	}, (err) => {
		errorHandler(data, err)
	});
}

function createCollection(data){
	return collection('createCollection', data)
}

function readCollection(data) {
	return collection('readCollection', data)
}

function updateCollection(data) {
	return collection('updateCollection', data)
}

function deleteCollection(data) {
	return collection('deleteCollection', data)
}


function collection(action, data){
	return new Promise((resolve, reject) => {

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
				const db = dbClient.db(database);
				if (action == 'readCollection') {

					let {query, sort} = getFilters(data);

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
							data = createData(data, collectionArray, type, errorLog)
							resolve(data)					
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
									data = createData(data, collectionArray, type, errorLog)
									resolve(data)					
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
										data = createData(data, collectionArray, type, errorLog)
										resolve(data)
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
										data = createData(data, collectionArray, type, errorLog)
										resolve(data)
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
			resolve(data);
		}
	}, (err) => {
		errorHandler(data, err)
	});
}

function createDocument(data){
	return document('createDocument', data)
}

function readDocument(data) {
	return document('readDocument', data)
}

function updateDocument(data) {
	return document('updateDocument', data)
}

function deleteDocument(data) {
	return document('deleteDocument', data)
}

function document(action, data){
	return new Promise(async (resolve, reject) => {

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
					const db = dbClient.db(database);
					const collectionObj = db.collection(collection);
					
					let {query, sort} = getFilters(data);
					if (data['organization_id']) {
						query['organization_id'] = { $eq: data['organization_id'] }
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
								data[type][i] = dotNotationToObject(data[type][i])

								if (!data[type][i]._id)
									data[type][i]._id = ObjectId()
								else 
									data[type][i]._id = ObjectId(data[type][i]._id)
								data[type][i]['created'] = {on: data.timeStamp, by: data.user_id || data.clientId}
							}
							if (action == 'readDocument') {
								if (data[type][i]._id)
									_ids.push(ObjectId(data[type][i]._id))
							}
							if (action =='updateDocument') {
								if (data[type][i]._id)
									update_ids.push({_id: data[type][i]._id, updateDoc: data[type][i], updateType: '_id'})
							
								if (!data[type][i]._id)
									updateData = createUpdate({document: [data[type][i]]}, type)

								data[type][i]['modified'] = {on: data.timeStamp, by: data.user_id || data.clientId}

							}
							if (action =='deleteDocument') {
								if (data[type][i]._id) {
									_ids.push(ObjectId(data[type][i]._id))
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
							
							for (let i = 0; i < data[type].length; i++)
								documents.push({db: 'mongodb', database, collection, ...data[type][i]})

							collectionsLength -= 1           
							if (!collectionsLength)
								databasesLength -= 1
							
							if (!databasesLength && !collectionsLength) {
								data = createData(data, documents, type, errorLog)
								resolve(data)					
							}
						});	
					}

					if (action == 'readDocument') {
						let index = 0, limit = 0
						if (data.filter) {
							const count = await collectionObj.estimatedDocumentCount()
							data.filter.count = count
	
							if (data.filter.startIndex)
								index = data.filter.startIndex
							if (data.filter.limit)
								limit = data.filter.limit
							if (limit)
								limit = index + limit;
						}
				
						collectionObj.find(query).limit(limit).sort(sort).toArray(function(error, result) {
							if (error) {
								error.database = database
								error.collection = collection 
								errorHandler(error)
							}
	
							if (result) {
								// ToDo: forEach at cursor
								for (let doc of result) {
									let isMatch = true
									if (data.filter && data.filter['search'])
										isMatch = searchData(doc, data.filter['search'])
									if (isMatch) {
										doc.db = 'mongodb'
										doc.database = database
										doc.collection = collection
										doc._id = doc._id.toString()
										documents.push(doc)
									}
								}

								if (index && limit) {
									documents = documents.slice(index, limit)
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
								data = createData(data, documents, type, errorLog)
								resolve(data)					
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
									if (data.filter && data.filter.search) {
										let searchResult = []

										for (let doc of result) {
											let isMatch = searchData(doc, data.filter.search)
											if (isMatch)
												searchResult.push(doc)
										}
										result = searchResult
									}
									resolve(result)
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
									doc['modified'] = {on: data.timeStamp, by: data.user_id || data.clientId}
								
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
									$update = createUpdate({document: [updateDoc]}, type)
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
									upsert: data.upsert,
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
										data = createData(data, documents, type, errorLog)
										resolve(data)					
									}
								})
							} 
							
							if (!update_ids.length) {
								docsLength -= 1
								if (!docsLength)
									collectionsLength -= 1  

								if (!collectionsLength)
									databasesLength -= 1
								
								if (!databasesLength && !collectionsLength) {
									data = createData(data, documents, type, errorLog)
									resolve(data)					
								}
							}

						}

						if (action == 'deleteDocument') {
							if (_ids.length == 1)
								query['_id'] = ObjectId(_ids[0])
							else if (_ids.length > 0)
								query['_id'] = {$in: _ids}
							collectionObj.deleteMany(query, function(error, result) {
								collectionsLength -= 1           
								if (!collectionsLength)
									databasesLength -= 1
								
								if (!databasesLength && !collectionsLength) {
									data = createData(data, documents, type, errorLog)
									resolve(data)					
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
			resolve(data);
		}
	}, (err) => {
		errorHandler(data, err)
	});

}

function createUpdate(data, type) {
	let update = {}, projection = {};
	if  (data[type][0]) {
		update['$set'] = data[type][0]
		// update['$set']['organization_id'] = data['organization_id'];
		if (update['$set']['_id'])
			delete update['$set']['_id']
		Object.keys(update['$set']).forEach(x => {
			projection[x] = 1
		})
	}
		
	if ( data['deleteName'] ) {
		update['$unset'] = replaceArray(data['deleteName']);
	}
	
	if ( data['updateName'] ) {
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

function createData(data, array, type, errorLog) {
	if (errorLog.length > 0)
		data['error'] = errorLog

	if (!data.request)
		data.request = data[type] || {}

	if (data.filter && data.filter.sort)
		data[type] = sortData(array, data.filter.sort)
	else
		data[type] = array
		
	if (data.returnLog){
		if (!data.log)
			data.log = []
		data.log.push(...data[type])
	}
	
	return data
}

function getFilters(data) {
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

	query = createQuery(filter.query);


	if (filter.sort)
		for (let i = 0; i < filter.sort.length; i++)
			sort[filter.sort[i].name] = filter.sort[i].direction
	
	return {query, sort}
}

// ToDo: create impved mongodb query to cover many cases
function createQuery(filters) {
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
			case '$includes':
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
				// var in_values = [];
				// item.value.forEach(function(v) {
				// 	in_values.push(new RegExp(".*" + v + ".*", "i"));
				// });
				
				query[key] = {$in : item.value }
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

function errorHandler(data, error, database, collection){
	if (typeof error == 'object')
		error['db'] = 'mongodb'
	else
		error = {db: 'mongodb', message: error}

	if (database)
		error['database'] = database
	if (collection)
		error['collection'] = collection
	if (data.error)
		data.error.push(error)
	else
		data.error = [error]
}
	
function replaceArray(data) {
	let keys = Object.keys(data);
	let objectData = {};
  
	keys.forEach((k) => {
		let nk = k
		if (/\[([0-9]*)\]/g.test(k)) {
			nk = nk.replace(/\[/g, '.');
			if (nk.endsWith(']'))
			nk = nk.slice(0, -1)
			nk = nk.replace(/\]./g, '.');
			nk = nk.replace(/\]/g, '.');
		}
	  	objectData[nk] = data[k];
	});
	
	return objectData;
}


module.exports = {
	databaseStats,
    createDatabase,
    readDatabase,
    updateDatabase,
    deleteDatabase,
    
    createCollection,
    readCollection,
    updateCollection,
    deleteCollection, 

    createDocument, 
    readDocument,
    updateDocument, 
    deleteDocument, 
}
