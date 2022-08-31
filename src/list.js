const {ObjectId} = require("mongodb");

class CoCreateList {
	constructor(wsManager, dbClient) {
		this.wsManager = wsManager
		this.dbClient = dbClient
		this.init()
	}
	
	init() {
		this.wsManager.on('readDocuments', (socket, data, socketInfo) => this.readDocuments(socket, data, socketInfo));
		this.wsManager.on('readCollections', (socket, data, socketInfo) => this.readCollections(socket, data, socketInfo));
	}
	
	/**
	 * 
	 * 
		data: {
			collection: "modules",
			element: "xxxx",
			metadata: "",
			operator: {
				filters: [{
					name: 'field1',
					operator: "$contain | $range | $eq | $ne | $lt | $lte | $gt | $gte | $in | $nin | $geoWithin",
					value: [v1, v2, ...]
				}, {
					....
				}],
				orders: [{
					name: 'field-x',
					type: 1 | -1
				}],
				search: {
					type: 'or | and',
					value: [value1, value2]
				},
				
				startIndex: 0 (integer),
				count: 0 (integer)
			},
			
			//. case fetch document case
			export: true | false
			-------- additional response data -----------
			data: [] // array
	 }
	 **/
	async readDocuments(socket, data, socketInfo) {		
		function sleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		}

		const self = this;
		
		try {
			const db = this.dbClient.db(data['organization_id']);
			const collection = db.collection(data["collection"]);
			let {operator, query, sort} = this.getFilters(data);
			collection.find(query).sort(sort).toArray(function(error, result) {
				if (result) {
					let result_data = self.filterResponse(result, data, operator)
					self.wsManager.send(socket, 'readDocuments', { ...data, data: result_data, operator, socketInfo });
				} else {
					console.log(error)
					self.wsManager.send(socket, 'ServerError', error, socketInfo);
				}
			})
		} catch (error) {
			console.log('readDocuments error', error);
			this.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}
	
	async readCollections(socket, data, socketInfo) {
		try {
			const self = this;
			data['collection'] = 'collections'
			
			let {operator, query, sort} = this.getFilters(data);
			const db = this.dbClient.db(data['organization_id']);
			db.listCollections(query).toArray(function(error, result) {
				if (!error && result && result.length > 0) {
					let orderField = Object.keys(sort)[0]
					if (orderField) {
						let orderType = sort[orderField];
						let orderValueType = "";
						let sortData;
						if (orderType == '-1') {
							if (orderValueType == 'number')
								sortData = result.sort((a, b) => 
									b[orderField] - a[orderField]
								);
							else
								sortData = result.sort((a, b) => 
									b[orderField].localeCompare(a[orderField])
								);
						} else {
							if (orderValueType == 'number')
								sortData = result.sort((a, b) => 
									a[orderField] - b[orderField]
								);
							else
								sortData = result.sort((a, b) => 
									a[orderField].localeCompare(b[orderField])
								);
							
						}
						result = sortData
					}

					self.wsManager.send(socket, 'readCollections', {...data, data: result }, socketInfo);
				}
			})			
		} catch(error) {
			console.log('readCollections error', error); 
			this.wsManager.send(socket, 'ServerError', 'error', socketInfo);
		}
	}
	
	/**
	 * function that make query from data
	 * 
	 */
	filterResponse(result, data, operator) {
		if (operator['search']['type'] == 'and') {
			result = this.readAndSearch(result, operator['search']['value']);
		} else {
			result = this.readOrSearch(result, operator['search']['value']);
		}
		
		const total = result.length;
		const startIndex = operator.startIndex;
		const count = operator.count;
		let result_data = [];
		
		if (data.created_ids && data.created_ids.length > 0) {
			let _nn = (count) ? startIndex : result.length;
			
			for (let ii = 0; ii < _nn; ii++) {
				
				const selected_item = result[ii];
				data.created_ids.forEach((fetch_id, index) => {
					if (fetch_id == selected_item['_id']) {
						result_data.push({ item: selected_item, position: ii })
					}
				})
			}
		} else {
			if (startIndex) result = result.slice(startIndex, total);
			if (count) result = result.slice(0, count)
			
			result_data = result;
		}
		operator.startIndex = startIndex
		operator.count = count
		operator.total = total
		return result_data
	}

	getFilters(data) {
		let operator = {
			filters: [],
			orders: [],
			search: {
				value: [],
				type: "or"
			},
			startIndex: 0,
			...data.operator
		};

		let query = this.createQuery(operator);
		let sort = {}
		operator.orders.forEach((order) => {
			sort[order.name] = order.type
		});

		return {operator, query, sort}
	}

	createQuery(data) {
		var query = new Object();
	
		var filters = data['filters'];
		
		filters.forEach((item) => {
			if (!item.name) {
				return;
			}
			var key = item.name;
			if (!query[key]) {
				query[key] = {};
			}
			
			if (item.name == "_id") item.value = item.value.map(v => new ObjectId(v))
			
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
					query[key][item.operator] = item.value[0];
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
	
	
	//. or operator
	readOrSearch(results, search) {
		var tmp
		if (search && search.length > 0) {
	
			tmp = results.filter(function(item) {
				
				for (var key in item) {
					var value = item[key];
					var __status = false;
					
					var str_value = value;
					
					if (Array.isArray(str_value) || typeof str_value == 'number') {
						str_value = str_value.toString();
					}
					
					if (typeof str_value == 'string') {
						str_value = str_value.toUpperCase();
					}
	
					for (let i = 0; i < search.length; i++) {
						if (typeof search[i] == 'string' && typeof str_value == 'string') {
							if (str_value.indexOf(search[i].toUpperCase()) > -1) {
								__status = true;
								break;
							}
						} else {
							if (value == search[i]) {
								__status = true;
								break;
							}
						}
					}
					
					if (__status) {
						return true;
					}
				}
				
				return false;
			})  
		} else {
			tmp = results;
		}
		
		return tmp;
	}
	
	
	//. and operator
	readAndSearch(results, search) {
		var tmp
		if (search && search.length > 0) {
					
			tmp = results.filter(function(item) {
	
				for (let i = 0; i < search.length; i++) {
					var __status = false;
					
					for (var key in item) {
						var value = item[key];
						
						if (typeof search[i] == 'string') {
							
							if (Array.isArray(value) || typeof value == 'number' ) {
								value = value.toString();
							} 
							
							if (typeof value == 'string') {
								value = value.toUpperCase();  
								if (value.indexOf(search[i].toUpperCase()) > -1) {
									__status = true;
									break;
								}
							}
							
						} else {
							if (value == search[i]) {
								__status = true;
								break;
							}
						}
					}
					
					if (!__status) {
						return false;  
					}
				}
				
				return true;
			})  
		} else {
			tmp = results;
		}
		
		return tmp;
	}	
}

module.exports = CoCreateList;