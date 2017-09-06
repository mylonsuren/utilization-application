function UsefulFunctions() {
	this.contains = function(item, array, field) {
	//if field is not specified, this function will just search the array for the item and return the index or return -1 if the item is not in the array
	//if field is specified, then it is assumed that the array is an array of objects and it will search for whether or not the specified field contains the item for each object in the array
		//for example contains("Bob", [{name: "Alice"}, {name: "Bob"}], "name") will return true
		for(var i = 0; i < array.length; i++) {
			if(field == undefined) {
				if(array[i] === item) {
					return i;
				}
			} else {
				if(array[i][field] === item) {
					return i;
				}
			}
		}
		return -1;
	}

	this.calculatePercent = function(value1, value2, decimalPlaces) {
		var factor = Math.pow(10, decimalPlaces);
		return (Math.round(value1/value2 * 100 * factor))/factor;
	}

	this.round = function (value, decimals) {
	  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	this.redirectTOETA = function(id) {
		window.open(
			"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
			'_blank'
		);
	}
}
