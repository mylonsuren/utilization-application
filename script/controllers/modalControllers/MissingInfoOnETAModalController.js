CSMApp.controller('MissingInfoOnETAModalController', function($scope, $http) {

	//show loader
	$scope.isLoading = true;

	// library of functions
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// get account data
	$http.get('https://eta2-api.w3ibm.mybluemix.net/teams/589b900e08916c00353748da/lists/accounts')
	.then(function(object) {
		var teams = object.data.payload;

		// get client data
		$http.get('https://eta2-api.w3ibm.mybluemix.net/clients')
		.then(function(object) {
			var clients = object.data.payload;


			// determine fields in csm information row
			$scope.results = [];

			var fields = {
				"csmRole" : "Role",
				"csmOnboard" : "CSM On-Board",
				"contractType" : "Contract Type",
				"csmCapacity" : "Capacity (The level of Premium Support i.e. 20%)",
				"csmStatus" : "Status",
				"csmExit" : "CSM Exit",
				"csmRegion" : "Region",
				"csmPercentTimeSpent" : "% Time Spent",
			}

			var fieldsValue = ["csmRole", "csmOnboard", "contractType", "csmCapacity", "csmStatus", "csmExit", "csmRegion", "csmPercentTimeSpent"];

			// determine what fields are missing (blank, or null)
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
						}
					}
				}
			}

			// determine the affected clients
			$scope.affectedClients = [];

			for (var i = 0; i < $scope.results.length; i++) {
				var index =  getIndexArrayClient($scope.affectedClients, $scope.results[i].client);

				if (index == -1) {
					$scope.affectedClients.push({
						clientName: $scope.results[i].client,
						csms: [{
							name: $scope.results[i].name,
							id: $scope.results[i].id,
							missingFields: $scope.results[i].missingFields,
						}],
					});
				}
				else {
					$scope.affectedClients[index].csms.push({
						name: $scope.results[i].name,
						id: $scope.results[i].id,
						missingFields: $scope.results[i].missingFields,
					});
				}
			}

			// refresh modal
			$('.ui.long.modal.MissingInfoOnETA').modal('refresh');


			// function to get index of value in an array of client objects
			function getIndexArrayClient(arr, value) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].clientName == value) {
						return i;
					}
				}
				return -1;
			}

			// function to get index of value in array
			function getIndexArray(arr, value) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] === value) {
						return i;
					}
				}
				return -1;
			}

			// hide loader
			$scope.isLoading = false;

			// determine when modal is loaded, and refresh modal
			$scope.$on('modal coming in', function(e) {
				$('.ui.long.modal.MissingInfoOnETA').modal('refresh');
			});

		});
	});

	// get client name from its id
	function fetchClientNameFromID(clients, clientID) {
		for(var i = 0; i < clients.length; i++) {
			if(clientID === clients[i]._id) {
				return clients[i].name;
			}
		}
		return undefined;
	}

	// get available screen width
	$scope.screenWidth = window.screen.availWidth;

	// link to eta main page
	$scope.goToETA = function() {
		window.open(
			"https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
			'_blank'
		)
	}

	// link to main report page
	$scope.viewPDFMissingInfo = function() {
		window.open(
			'/Reports/MissingInfoOnETAReport',
			'_blank' // <- This is what makes it open in a new window.
		);
	};

	//determine how many clients are not showing up on modal
	$scope.viewMoreButton = function(arr) {
		if (arr === undefined) {
			return '';
		}
		if (arr.length - 3 > 0 ) {
			return arr.length - 3;
		}
		return '';
	};

	// close modal function
	$scope.closeModal = function() {
		$('.ui.long.modal')
		.modal('hide');
	}

	// link to client's account page on eta
	$scope.redirect = function(id) {
		window.open(
			"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
			'_blank'
		)
	}

});
