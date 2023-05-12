const json2csv = require("json-2-csv")
const csvtojson = require("csvtojson");

class CoCreateBackup {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.importCollection = '';
		this.importType = '';
		this.importDB = '';
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			// this.wsManager.on('exportDB',		(socket, data) => this.exportData(socket, data));
			// this.wsManager.on('importDB',		(socket, data) => this.importData(socket, data));
			// this.wsManager.on('importFile2DB',	(socket, data) => this.importData(socket, data));
			
			// this.wsManager.on('downloadData',	(socket, data) => this.downloadData(socket, data))
		}
	}
	
	/**
	 * data: {
	 	collection: '',
	 	type: 'csv/json'
	 	data: JSON data
	 }
	**/
	// async downloadData(socket, data) {
	// 	const export_type = data.type || "json";
		
	// 	try {
	// 		let binaryData = null;
	// 		const result = data.data;
	// 		const organization_id = socket.config.organization_id ;
	// 		if (export_type === 'csv') {
	// 			binaryData = await json2csv.json2csvAsync(JSON.parse(JSON.stringify(result)), {
	// 				emptyFieldValue: ''
	// 			});
	// 		} else {
	// 			binaryData = Buffer.from(JSON.stringify(result));
	// 		}
			
	// 		this.wsManager.send(socket, 'downloadFileInfo', {file_name: `backup_${data['collection']}.${export_type}`, binaryData, export_type}, organization_id);

	// 		this.wsManager.sendBinary(socket, binaryData, organization_id);

	// 	} catch (error) {
	// 		console.log('export error', error); 
	// 	}
	// }

	/**
	CoCreateSocket.exportData({
		collection: '',
		db: '',
		export_type: json/csv,
		
	})
	**/
	// async exportData(socket, data) {
	// 	const self = this;
		
	// 	const export_type = data.export_type || "json";

	// 	try {
			
	// 		var collection = this.dbClient.db(data['namespace']).collection(data["collection"]);
	// 		const organization_id = socket.config.organization_id
			
	// 		var query = {};
			
	// 		collection.find(query).toArray(async function(error, result) {
	// 			if (!error) {
	// 				let binaryData = null;
	// 				self.wsManager.send(socket, 'downloadFileInfo', {file_name: `backup_${data['collection']}.${export_type}`}, organization_id);
	// 				if (export_type === 'csv') {
	// 					binaryData = await json2csv.json2csvAsync(JSON.parse(JSON.stringify(result)), {
	// 						emptyFieldValue: ''
	// 					});
	// 				} else {
	// 					binaryData = Buffer.from(JSON.stringify(result));
	// 				}

	// 				self.wsManager.sendBinary(socket, binaryData, organization_id);
	// 			}
	// 		});
	// 	} catch (error) {
	// 		console.log('export error', error); 
	// 	}
	// }
	
	// async setImportData(socket, data) {
	// 	this.importCollection = data['collection']
	// 	this.importType = data['import_type'];
	// 	this.importDB = data['namespace'];
	// }

	// async importData(socket, data) {
	// 	const importCollection = data['collection']
	// 	const importType = data['import_type'];
	// 	const importFile = data['file'];
	// 	// const importDB = data['namespace'];
		
	// 	console.log('import:', importCollection, importType, importFile)
	// 	const self = this;
	// 	//	const organization_id = socket.config.organization_id
	// 	if (!importCollection || !importType) {
	// 		return;
	// 	}
	// 	try {
	// 		console.log('data: ', data)
	// 		// return;
	// 		let jsonData = null;
	// 		if (this.importType === 'csv') {
	// 			jsonData = await csvtojson({ignoreEmpty: true}).fromString(data.toString())
	// 		} 
	// 		else {
	// 			jsonData = JSON.parse(importFile.toString());	
	// 		}
	// 		// TODO: validate json / if json is object error happens
	// 		jsonData.map((item) => delete item._id);
	// 		console.log('json: ', jsonData)
	// 		var collection = this.dbClient.db(organization_id).collection(importCollection);
	// 		// console.log(this.importCollection)
	// 		collection.insertMany(jsonData, function(err, result) {
	// 			if (!err) {
	// 				self.wsManager.send(socket, 'importedFile2DB', {
	// 					'database': organization_id,
	// 					'collection': importCollection,
	// 					'import_type': importType,
	// 					'data': result
	// 				}, organization_id)
	// 			}
	// 		})
			
	// 		// this.importCollection = '';
	// 		// this.importType = '';
			
	// 	} catch (error) {
	// 		console.log('import db error', error)
	// 	}
		
	// }
	
}
module.exports = CoCreateBackup;



