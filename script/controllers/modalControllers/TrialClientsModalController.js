CSMApp.controller('TrialClientsModalController', function($scope, $http, $timeout , load) {

	// library of functions
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// show loader
	$scope.isLoading = true;

	// get data
	load.loadData().then(function(data) {

		// gather csm data
		$scope.csms = data;

		// hide loader
		$scope.isLoading = false;


		$scope.trialContracts = [];
		$scope.trialClients = [];
		$scope.trialCSMs = [];


		// get current trial accounts
		$scope.trialAccounts = query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true});

		$scope.geosTrialAccounts = [];
		// determine trial accounts within each geo
		$scope.geosTrialAccounts.push({
			name: "Americas",
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

		// determine trial clients (different from accounts)
		$scope.trialAccountClients = query.filterClients($scope.csms, {date: new Date, status: 'current', isTrial: true, removeOthers: true, removeDuplicates: true});


		// draw graph
		Highcharts.chart('geoPieChart', {
			chart: {
				type: 'pie',
				options3d: {
					enabled: true,
					alpha: 45,
					beta: 0
				}
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
						format: '{point.name} ({point.y})'
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

		// refresh modal once loaded
		$('.ui.long.modal.TrialClients').modal('observeChanges',true);

		$timeout(function() {
			$('.ui.long.modal.TrialClients').modal('refresh');
		}, 0);
		$scope.$on('modal coming in', function(e) {
			$('.ui.long.modal.TrialClients').modal('refresh');
		});


		// close modal function
		$scope.closeModal = function() {
			$('.ui.long.modal')
			.modal('hide');
		}

	});

	// refresh modal on resize
	window.onresize = function(event) {
		$('.ui.long.modal.TrialClients').modal('refresh');
	};

	// redirect to eta page for each client
	$scope.redirect = function(id) {
		window.open(
			"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
			'_blank'
		)
	}

});
