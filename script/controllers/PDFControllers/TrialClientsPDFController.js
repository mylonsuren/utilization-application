CSMApp.controller('TrialClientsPDFController', function($scope, $http, load) {

	// Library
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// Initialize Loader
	$scope.isLoading = true;

	// Get Data
	load.loadData().then(function(data) {

		// Gather CSM Data
		$scope.csmList = data;
		$scope.csms = $scope.csmList;

		// Initialize Arrays
		$scope.trialContracts = [];
		$scope.trialClients = [];
		$scope.trialCSMs = [];

		// Determine current Trial Accounts
		$scope.trialAccounts = query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true});

		// Round Numbers
		$scope.round = function (value, decimals) {
			return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		}

		// Determine Converted Trial Accounts
		var threeMonthsAgo = new Date();
		threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
		$scope.oldTrialAccounts = query.filterClients($scope.csms, {status: 'past', date: new Date, isTrial: true, removeOthers: true, removeDuplicates: true});
		$scope.currentAccounts = query.filterClients($scope.csms, {status: 'current', date: new Date, removeOthers: true, removeDuplicates: true, ignoreTrial: true});
		$scope.allTrialAccounts = query.filterClients($scope.csms, {removeOthers: true, removeDuplicates: true, isTrial: true});
		$scope.allAccounts = query.filterClients($scope.csms, {ignoreTrial: true, removeOthers: true, removeDuplicates:true});


		var trialAccountsCapacity = 0;
		var allCurrentAccountsCapacity = 0;
		$scope.percentageOfCurrentCapacity = 0;
		for (var i = 0; i < $scope.trialAccounts.length; i++) {
			trialAccountsCapacity += $scope.trialAccounts[i].clientCapacity;
		}
		for (var i = 0; i < $scope.currentAccounts.length; i++) {
			allCurrentAccountsCapacity += $scope.currentAccounts[i].clientCapacity;
		}

		// Determine trial capacity as a percentage of current overall capacity
		$scope.percentageOfCurrentCapacity = trialAccountsCapacity / allCurrentAccountsCapacity;

		$scope.totalTrialConversion = [];

		for (var i in $scope.allTrialAccounts) {
			for (var x in $scope.allAccounts) {
				if ($scope.allTrialAccounts[i].clientName == $scope.allAccounts[x].clientName) {
					if ($scope.allTrialAccounts[i].clientStart <= $scope.allAccounts[x].clientStart) {
						$scope.totalTrialConversion.push({
							clientName: $scope.allTrialAccounts[i].clientName,
							trialCSMs: $scope.allTrialAccounts[i].csms,
							premiumCSMs: $scope.allAccounts[x].csms,
							trialCap: $scope.allTrialAccounts[i].totalPurchased,
							premiumCap: $scope.allAccounts[x].totalPurchased,
						});
					}
				}
			}
		}

		$scope.convertedAccounts = [];
		for (var i in $scope.oldTrialAccounts) {
			for (var x in $scope.currentAccounts) {
				if ($scope.oldTrialAccounts[i].clientName == $scope.currentAccounts[x].clientName) {
					if ($scope.oldTrialAccounts[i].clientStart <= $scope.currentAccounts[x].clientStart) {
						$scope.convertedAccounts.push({
							clientName: $scope.oldTrialAccounts[i].clientName,
							trialCSMs: $scope.oldTrialAccounts[i].csms,
							currentCSMs: $scope.currentAccounts[x].csms,
							trialCap: $scope.oldTrialAccounts[i].totalPurchased,
							currentCap: $scope.currentAccounts[x].totalPurchased,
						});
					}
				}
			}
		}
		// End of converted trial accounts determination

		// Gather Data for Pie Graph
		$scope.geosTrialAccounts = [];

		$scope.geosTrialAccounts.push({
			name: "North America",
			accounts: query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true, geo: "North America"})
		});
		$scope.geosTrialAccounts.push({
			name: "Latin America",
			accounts: query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true, geo: "Latin America"})
		});
		$scope.geosTrialAccounts.push({
			name: "EMEA",
			accounts: query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true, geo: "EMEA"})
		});
		$scope.geosTrialAccounts.push({
			name: "Asia Pacific",
			accounts: query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true, geo: "Asia Pacific"})
		});


		// Determine each geos trial capacity as a percentage of its total capacity
		$scope.geos = ["North America", "Latin America", "EMEA", "Asia Pacific"];
		for(var i = 0; i < $scope.geosTrialAccounts.length; i++) {
			$scope.currentClients = query.filterClients($scope.csms, {date: new Date, status: 'current', removeOthers: true, geo: $scope.geos[i]});
			var currentAccountsCapacity = 0;
			var trialAccountsCapacity = 0;
			for (var j = 0; j < $scope.geosTrialAccounts[i].accounts.length; j++) {
				trialAccountsCapacity += $scope.geosTrialAccounts[i].accounts[j].clientCapacity;
			}
			for (var j = 0; j < $scope.currentClients.length; j++) {
				currentAccountsCapacity += $scope.currentClients[j].clientCapacity;
			}
			$scope.totalPercentage = trialAccountsCapacity / currentAccountsCapacity;
			$scope.geosTrialAccounts[i].percentage = trialAccountsCapacity / currentAccountsCapacity;
		}


		// Initialize and draw pie chart
		Highcharts.chart('geoPieChart', {
			chart: {
				type: 'pie',
			},
			title: {
				text: ''
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				series: {
					allowPointSelect: true,
					slicedOffset: 30,
				},
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					depth: 35,
					dataLabels: {
						enabled: true,
						distance: -50,
						formatter: function () {
							var point = this.point.y;
							if (point <= 0) {
								return '';
							} else {
								return this.point.name + ' (' + point + ')';
							}
						}
					}
				}
			},
			credits: {
				enabled: false
			},
			series: [{
				type: 'pie',
				name: '% of Total Contracts',
				data: [
					{
						name: "North America",
						color: "#031634",
						y: $scope.geosTrialAccounts[0].accounts.length
					},
					{
						name: "Latin America",
						color: "#1C9DB8",
						y: $scope.geosTrialAccounts[1].accounts.length
					},
					{
						name: "EMEA",
						color: "#033649",
						y: $scope.geosTrialAccounts[2].accounts.length
					},
					{
						name: "Asia Pacific",
						color: "#036564",
						y: $scope.geosTrialAccounts[3].accounts.length
					},
				]
			}]
		});

		// Current Trial Clients
		$scope.trialAccountClients = query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true, removeDuplicates: true});

		// Disable Loader
		$scope.isLoading = false;

		// Get new Data from ETA
		load.fetchFromETA();
		$scope.$apply();
	});

	// Table Sorting Orders
	$scope.convertedTableSortingOrder = 'clientName';
	$scope.totalConvertedOrder = 'clientName'

	// Get Month and Year from a date object
	$scope.getMonthYearDateFromDate = function(date) {
		var newDate = new Date(date);
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getFullYear()}`
	}

	// Print function
	$scope.print = function() {
		window.print();
	}

	// Round numbers
	$scope.round = function (value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}


	// Flip Sorting Orders
	$scope.flipSortOrder = function(value) {
		if (value.includes("-")) {
			console.log(value);
			return value.substring(1, value.length);
		}
		console.log(value);
		return "-" + value;
	};


});
