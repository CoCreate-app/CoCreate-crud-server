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
		const securityRes = await this.checkSecurity(req_data);
		const self = this;
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}

		const collection = this.db.collection(req_data["collection"]);
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