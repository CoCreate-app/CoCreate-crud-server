const CoCreateBase = require("./base");

class CoCreateUnique extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('checkUnique',			(socket, data, roomInfo) => this.checkUnique(socket, data, roomInfo));
		}
	}


	async checkUnique(socket, req_data) {
		const collection = this.db.collection(req_data["collection"]);
		const query = {
			[req_data['name']]: req_data['value']
		};
		
		try {
			collection.find(query).toArray(function(error, result) {
				if (!error && result) {
					let response = {
						request_id: req_data['request_id'],
						name: req_data['name'],
						unique: true
					};
					if (result.length) {
						response.unique = false;
					}
					self.wsManager.send(socket, 'checkedUnique', response, req_data['organization_id']);
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
	
}

module.exports = CoCreateUnique;