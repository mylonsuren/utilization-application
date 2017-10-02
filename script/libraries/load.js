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
								clientName: 'Test Company 3',
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
						},
						{
							csmName: 'Employee 3',
							id: 54321,
							csmCapacity: 100,
							region: 'Latin America',
							status: 'active',
							otherWork: 10,
							assigned: 80,
							utilization: 150,
							workEffort: 120,
							clients: [{
								clientName: 'Test Company 4',
								clientRegion: 'Latin America',
								id: 1234567,
								clientCapacity: 80,
								percentTimeSpent: 120,
								clientMarket: 'Canada',
								clientStart: oldDate,
								clientEnd: date,
								isTrial: 'premsupp',
								csm: 'Employee 3',
								role: 'CSM',
								country: 'Canada',
							}]
						},
						{
							csmName: 'Employee 2',
							id: 54321,
							csmCapacity: 100,
							region: 'North America',
							status: 'active',
							otherWork: 10,
							assigned: 40,
							utilization: 120,
							workEffort: 60,
							clients: [{
								clientName: 'Test Company 3',
								clientRegion: 'North America',
								id: 12345,
								clientCapacity: 20,
								percentTimeSpent: 20,
								clientMarket: 'Canada',
								clientStart: oldDate,
								clientEnd: date,
								isTrial: 'premsupp',
								csm: 'Employee 2',
								role: 'CSM',
								country: 'Canada',
							}]
						},
						{
							csmName: 'Test Account 2',
							id: 54321,
							csmCapacity: 100,
							region: 'North America',
							status: 'active',
							otherWork: 20,
							assigned: 60,
							utilization: 80,
							workEffort: 80,
							clients: [{
								clientName: 'GM',
								clientRegion: 'North America',
								id: 123112345,
								clientCapacity: 60,
								percentTimeSpent: 80,
								clientMarket: 'Canada',
								clientStart: oldDate,
								clientEnd: date,
								isTrial: 'premsupp',
								csm: 'Test Account 2',
								role: 'CSM',
								country: 'Canada',
							}]
						},
						{
							csmName: 'Test Account 3',
							id: 54321,
							csmCapacity: 100,
							region: 'EMEA',
							status: 'active',
							otherWork: 20,
							assigned: 80,
							utilization: 80,
							workEffort: 80,
							clients: [{
								clientName: 'IBM',
								clientRegion: 'North America',
								id: 123115983212345,
								clientCapacity: 80,
								percentTimeSpent: 80,
								clientMarket: 'Canada',
								clientStart: oldDate,
								clientEnd: date,
								isTrial: 'premsupp',
								csm: 'Test Account 3',
								role: 'CSM',
								country: 'Canada',
							}]
						},
						{
							csmName: 'Test Account 4',
							id: 54321,
							csmCapacity: 100,
							region: 'Latin America',
							status: 'active',
							otherWork: 20,
							assigned: 100,
							utilization: 100,
							workEffort: 100,
							clients: [{
								clientName: 'RBC',
								clientRegion: 'North America',
								id: 1235122345,
								clientCapacity: 100,
								percentTimeSpent: 100,
								clientMarket: 'Canada',
								clientStart: oldDate,
								clientEnd: date,
								isTrial: 'premsupp',
								csm: 'Test Account 4',
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
