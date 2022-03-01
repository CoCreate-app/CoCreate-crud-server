
const CoCreateBase = require("./base");
const {ObjectID, Binary} = require("mongodb");

class CoCreateIndustry extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('runIndustry',	(socket, data, roomInfo) => this.runIndustry(socket, data));
			this.wsManager.on('createIndustry',	(socket, data, roomInfo) => this.createIndustry(socket, data));
			this.wsManager.on('fetchInfoForBuilder', (socket, data) => this.fetchInfoForBuilder(socket, data))
		}
	}
	
	/**
	 * Run Industry logic
	 **/
	async runIndustry(socket, data) {
		const {industry_id, newOrg_id} = data
		const db = data.organization_id;
		let industryDocumentsCollection = this.getDB(db).collection('industry_documents');


		let industry = await this.getDB(db).collection('industries').findOne({_id: ObjectID(industry_id)});
		let error = null;

		if (!industry._id) {
			error = "Can't get industry"
		} else {
			let newOrgDocument = await this.getDB(db).collection('organizations').findOne({_id: ObjectID(newOrg_id)});
			
			if (!newOrgDocument) {
				error = "Can't get organization";
			} else {
				let new_subdomain = newOrgDocument && newOrgDocument.domains ? newOrgDocument.domains[0] : "";
				
				const {adminUI_id, builderUI_id, idPairs} = await this.createEmptyDocumentsFromIndustry
				(
					industryDocumentsCollection, 
					industry_id, 
					newOrgDocument,
					industry.organization_data || {}, 
					new_subdomain
				);
				await this.updateDocumentsByIndustry(idPairs, newOrg_id)	
				this.wsManager.send(socket, 'runIndustry', {
					error: false,
					message: "successfuly",
					adminUI_id,
					builderUI_id,
					industry_id
				}, data['organization_id'])
				return;
			}
		}
		if (error) {
			this.wsManager.send(socket, 'runIndustry', {
				error: true,
				message: error,
			}, data['organization_id'])
		}


	}
	
	async createEmptyDocumentsFromIndustry(industryDocumentsCollection, industry_id, newOrg, orgData, new_subdomain) {
		const newOrgId = newOrg._id.toString();
		const newOrgApiKey = newOrg.apiKey;

		const {subdomain, apiKey, organization_id} = orgData;

		
		const newDB = this.getDB(newOrgId);
		const self = this;
		let adminUI_id = '';
		let builderUI_id = '';
		let idPairs = [];
		
		let documentCursor = industryDocumentsCollection.find({"industry_data.industry_id" : industry_id})
		
		while(await documentCursor.hasNext()) {
			let document = await documentCursor.next();
			const {collection, document_id, industry_id} = document.industry_data || {}
			if (!collection || !document_id) {
				continue;
			}
			const collectionInstance = newDB.collection(collection);

			document['organization_id'] = newOrgId;
			
			delete document['_id'];
			delete document['industry_data'];
			
			//. replace subdomain
			for (let field in document) {
				if (field != '_id' && field != 'organization_id') {
					if (subdomain && new_subdomain) {
						document[field] = self.replaceContent(document[field], subdomain, new_subdomain);
					}
					
					if (newOrgId && organization_id) {
						document[field] = self.replaceContent(document[field], organization_id, newOrgId);
					}
					if (newOrgApiKey && apiKey) {
						document[field] = self.replaceContent(document[field], apiKey, newOrgApiKey);
					}
				}
			}

			let newDocument = await collectionInstance.insertOne(document);
			if (newDocument) {
				if (newDocument['ops'][0].name == 'Admin UI') {
					adminUI_id = newDocument['ops'][0]['_id'];
				} else if (newDocument['ops'][0].name == 'Builder UI') {
					builderUI_id = newDocument['ops'][0]['_id'];
				}
				
				idPairs.push({
					new_id : newDocument['ops'][0]['_id'].toString(),
					old_id : document_id,
					collection_name: collection
				})
			}		
		}
		// console.log(idPairs);
		// console.log(idPairs.length);
		
		return {
			adminUI_id: adminUI_id,
			builderUI_id: builderUI_id,
			idPairs: idPairs
		}
	}
	
	async updateDocumentsByIndustry(idPairs, newOrgId) {
		const newDB = this.getDB(newOrgId);
		
		for (let i = 0; i < idPairs.length; i++) {
			const {collection_name, new_id} = idPairs[i];
			const collection = newDB.collection(collection_name);
			
			let document = await collection.findOne({'_id': ObjectID(new_id)});
			
			for (let field in document) {
				if (field != '_id' && field != 'organization_id') {
					var newFieldValue = this.replaceId(document[field], idPairs);
					document[field] = newFieldValue;
				}
			}
			
			delete document['_id'];
			await collection.findOneAndUpdate({'_id': ObjectID(new_id)}, {$set: document});
		}
	}
	
	replaceId(fieldValue, idPairs) {
		const self = this;
		idPairs.forEach(({old_id, new_id}) => {
			fieldValue = self.replaceContent(fieldValue, old_id, new_id)
		})
		return fieldValue;
	}
	
	replaceContent(content, src, target) {
		const type = typeof content
		if (type == 'string') {
			content = content.replace(new RegExp(src, 'g'), target);
		} else if (type == "object") {
			for (let key in content) {
				if (content[key] && typeof content[key] == 'string') {
					content[key] = content[key].replace(new RegExp(src, 'g'), target);
				}
			}
		}
		return content
	}
	
	/**
	 * Create industry
	 **/
	async createIndustry(socket, data)
	{
		try {
			const {organization_id, db} = data;
			const self = this;
			const collection = this.getCollection(data);
			
			let orgDocument = await this.getDB(db).collection('organizations').findOne({_id: ObjectID(organization_id)});
			let subdomain = orgDocument && orgDocument.domains ? orgDocument.domains[0] : "";
			
			let insertData = data.data;
			insertData.organization_data = {
				subdomain: subdomain,
				apiKey: orgDocument.apiKey,
				organization_id: organization_id
			}
			//. set masterDB			
			insertData.organization_id = db || organization_id;
			let insertResult = await collection.insertOne(insertData);

			const industry_id = insertResult.ops[0]._id + "";
			// const anotherCollection = self.getDB(organization_id).collection(data['collection']);
			// //. update organization
			// insertResult.ops[0].organization_id = organization_id;
			// anotherCollection.insertOne(insertResult.ops[0]);
			
			//. create inustryDocuments
			const srcDB = this.getDB(organization_id);
			let collections = []
			const exclusion_collections = ["users", "organizations", "industries", "industry_documents", "crdt-transactions", "metrics"];
			collections = await srcDB.listCollections().toArray()
			collections = collections.map(x => x.name)

			for (let i = 0; i < collections.length; i++) {
				let collection = collections[i];
				if (exclusion_collections.indexOf(collection) > -1) {
					continue;
				}
				await self.insertDocumentsToIndustry(collection, industry_id, organization_id, db);
			}
			
			//. update subdomain
			const response  = {
				'db': data['db'],
				'organization_id': organization_id,
				'industry_id': industry_id,
				'data': collections,
				'metadata': data['metadata'],
			}
			
			console.log(response)
			self.wsManager.send(socket, 'createIndustry', response, data['organization_id']);

			
		} catch (error) {
			console.log(error)
		}
	}

	async insertDocumentsToIndustry(collectionName, industryId, organizationId, targetDB) {
		try{
			const industryDocumentsCollection = this.getDB(targetDB).collection('industry_documents');
			const collection = this.getDB(organizationId).collection(collectionName);

			const  query = {
				'organization_id': organizationId
			}

			const documentCursor = collection.find(query);
			await documentCursor.forEach(async (document) => {
				var documentId = document['_id'].toString();
	
				delete document['_id'];
				
				document['industry_data'] = {
					document_id: documentId,
					industry_id: industryId,
					collection: collectionName,
				}

				industryDocumentsCollection.update(
					{
						"industry_data.document_id" : {$eq: documentId},
						"industry_data.industry_id" : {$eq: industryId},
						"industry_data.collection"	: {$eq: collectionName},
					},
					{ 
						$set: document
					},
					{
						upsert: true
					}
				);
			})
		}
		catch (e) {
			console.log(e)
		}
	}
	
	//. builder
	async fetchInfoForBuilder(socket, data) {		
		try {
				
			var collectionList = [];
			var modules = [];
			this.db.listCollections().toArray(function(err, collInfos) {
				
				collInfos.forEach(function(colInfo) {
					collectionList.push(colInfo.name);
				})
				
				const modulesCollection = this.db.collection('modules');
				modulesCollection.find().toArray(function(error, result) {
					result.forEach(function(item) {
						modules.push({
							_id: item['_id'],
							name: item['name']
						})
					})
					
					self.wsManager.send(socket, 'fetchedInfoForBuilder', {
						collections: collectionList,
						modules: modules
					}, data['organization_id']);
				})
			});
		} catch (error) {
			console.log('fetchInfoBuilder error');
		}
	}
}

module.exports = CoCreateIndustry;