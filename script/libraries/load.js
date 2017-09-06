CSMApp.service('load', function($http, $q) {

	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	var apiEndpointRoot = 'https://eta2-api.w3ibm.mybluemix.net/';

	this.fetchFromETA = function() {
		return new Promise(
			function(resolve, reject) {
				// var teamsPromise = $http.get(apiEndpointRoot + 'teams/589b900e08916c00353748da/lists/accounts');
				// var clientsPromise = $http.get(apiEndpointRoot + 'clients');
				// var usersPromise = $http.get(apiEndpointRoot + 'users');
				// var otherWorksPromise = $http.get(apiEndpointRoot + 'other_works');
				//
				// $q.all([teamsPromise, clientsPromise, usersPromise, otherWorksPromise])
				// 	.then(function(data) {
				// 		csmList = query.convertData(data[0].data.payload, data[1].data.payload, data[2].data.payload, data[3].data.payload);
				// 		localStorage['csmData'] = JSON.stringify(csmList);
				// 		resolve(csmList);
				// 	});



						var date = new Date();
						date.setDate(date.getDate() + 30);

						var oldDate = new Date();
						oldDate.setDate(oldDate.getDate() - 30);

						csmList = [{
							csmName: 'Test Account',
							id: 54321,
							csmCapacity: 100,
							region: 'Asia Pacific',
							status: 'active',
							otherWork: 20,
							assigned: 20,
							utilization: 20,
							workEffort: 20,
							clients: [{
								clientName: 'Mac Eng',
								clientRegion: 'North America',
								id: 12345,
								clientCapacity: 20,
								percentTimeSpent: 20,
								clientMarket: 'Canada',
								clientStart: oldDate,
								clientEnd: date,
								isTrial: 'premsupp',
								csm: 'Test Account',
								role: 'CSM',
								country: 'Canada',
							}]
						}];
						localStorage['csmData'] = JSON.stringify(csmList);
						resolve(csmList);
			}
		);



	}

	this.loadData = function() {
		return new Promise((resolve, reject) => {
				if('csmData' in localStorage) {
					resolve(JSON.parse(localStorage['csmData']));
				} else {
					this.fetchFromETA().then(function(data) {
						resolve(data);
					});
				}
		});
	}
});
