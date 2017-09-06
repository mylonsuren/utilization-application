CSMApp.controller('MissingInfoOnETAPDFController', function($scope, $http) {

	// Initialize Loader
	$scope.isLoading = true;

	// Library
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// Get Account Data from ETA
	$http.get('https://eta2-api.w3ibm.mybluemix.net/teams/589b900e08916c00353748da/lists/accounts')
	.then(function(object) {
		var teams = object.data.payload;

		// Get Client Data from ETA
		$http.get('https://eta2-api.w3ibm.mybluemix.net/clients')
		.then(function(object) {
			var clients = object.data.payload;

			// Function to get Index of Value in an Array
			function getIndexArray(arr, value) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] === value) {
						return i;
					}
				}
				return -1;
			}

			// Library of Useful Functions
			var library = new UsefulFunctions();

			// Initialize Arrays
			$scope.results = [];
			$scope.clients = [];
			$scope.csms = [];

			// Determine Fields in the CSM Information Row on ETA
			var fields = {
				"csmRole" : "Role",
				"csmOnboard" : "CSM On-Board",
				"contractType" : "Contract Type",
				"csmCapacity" : "Capacity (The level of Premium Support i.e. 20%)",
				"csmStatus" : "Status",
				"csmExit" : "CSM Exit",
				"csmRegion" : "Region",
				"csmPercentTimeSpent" : "% Time Spent"
			}
			var fieldsValue = ["csmRole", "csmOnboard", "contractType", "csmCapacity", "csmStatus", "csmExit", "csmRegion", "csmPercentTimeSpent"];

			// Determine which fields are missing, and push them to the results
			// array to be displayed to the user
			for(var i = 0; i < teams.length; i++) {
				if(teams[i].csmInfo.length > 0) {
					for(var j = 0; j < teams[i].csmInfo.length; j++) {
						var obj = {};
						obj.id = teams[i]._id;
						obj.client = fetchClientNameFromID(clients, teams[i].clientId);
						obj.clientRegion = query.mapMarketToRegion(teams[i].clientRegion);
						obj.name = teams[i].csmInfo[j].name;
						obj.missingFields = [];

						for(field in teams[i].csmInfo[j]) {
							if ((teams[i].csmInfo[j][field] == null || teams[i].csmInfo[j][field]== undefined || teams[i].csmInfo[j][field] === '')
							&& (field !=='uid' && field !== 'name' && field !== 'email')) {
								obj.missingFields.push(fields[field]);
							}
						}

						if (teams[i].csmInfo[j].csmPercentTimeSpent == undefined && getIndexArray(obj.missingFields, '% Time Spent') === -1) {
							obj.missingFields.push("% Time Spent");
						}

						if(obj.missingFields.length > 0) {
							$scope.results.push(obj);
							var clientName = fetchClientNameFromID(clients, teams[i].clientId);
							var clientIndex = getIndexArray($scope.clients, clientName);
							if (clientIndex === -1) {
								$scope.clients.push(clientName);
							}
							var csmIndex = getIndexArray($scope.csms, teams[i].csmInfo[j].name);
							if (csmIndex === -1) {
								$scope.csms.push(teams[i].csmInfo[j].name);
							}
						}
					}
				}
			}

			// Disable Loader
			$scope.isLoading = false;

			// Initialize Search Menu Dropdowns
			$('#clientDropdown').dropdown();
			$('#csmDropdown').dropdown();

		});
	})
	.catch(function(error) {
		console.log("Error: " + error);
	});

	// Function to get Client Name from ID
	function fetchClientNameFromID(clients, clientID) {
		for(var i = 0; i < clients.length; i++) {
			if(clientID === clients[i]._id) {
				return clients[i].name;
			}
		}
		return undefined;
	}

	// Link to ETA Main Page
	$scope.goToETA = function() {
		window.open(
			"https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
			'_blank'
		)
	}

	// Initialize the table sorting order
	$scope.clientTableSortingOrder = 'client';

	// Flip the Table sorting order
	$scope.flipSortOrder = function(value) {
		if (value.includes("-")) {
			return value.substring(1, value.length);
		}
		return "-" + value;
	};

	// Redirect to appropriate client account page on ETA
	$scope.redirect = function(id) {
		window.open(
			"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
			'_blank'
		)
	}

});
