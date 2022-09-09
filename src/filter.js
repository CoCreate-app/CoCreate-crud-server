function filterData(result, data, operator) {
	if (operator['search']['type'] == 'and') {
		result = andSearch(result, operator['search']['value']);
	} else {
		result = orSearch(result, operator['search']['value']);
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
	operator.total
	= total
	return result_data
}

//. or operator
function orSearch(results, search) {
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
function andSearch(results, search) {
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
function sortData(data, sort) {
	let orderField = Object.keys(sort)[0]
	if (orderField) {
		let orderType = sort[orderField];
		let orderValueType = "";
		let sortData;
		if (orderType == '-1') {
			if (orderValueType == 'number')
				sortData = data.sort((a, b) => 
					b[orderField] - a[orderField]
				);
			else
				sortData = data.sort((a, b) => 
					b[orderField].localeCompare(a[orderField])
				);
		} else {
			if (orderValueType == 'number')
				sortData = data.sort((a, b) => 
					a[orderField] - b[orderField]
				);
			else
				sortData = data.sort((a, b) => 
					a[orderField].localeCompare(b[orderField])
				);
			
		}
		return sortData;
	}
}	

module.exports = {
	filterData,
	andSearch,
	orSearch,
	sortData
  };
  