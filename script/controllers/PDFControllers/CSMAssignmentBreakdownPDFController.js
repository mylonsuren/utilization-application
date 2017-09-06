
CSMApp.controller("CSMAssignmentBreakdownPDFController", function($scope, $http, $timeout, load) {

	// Library of Useful Functions
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// Initialize Loader
	$scope.isLoading = true;

	// Get Data
	load.loadData().then(function(data) {
		// Gather CSM Data
		var csmList = data;
		$scope.csms = query.filterCSMS(csmList, {});

		// Disable Loaders
		$scope.isLoading = false;

		// Enable Secondary Loaders
		$scope.creatingNAPDF = true;
		$scope.creatingLAPDF = true;
		$scope.creatingAPPDF = true;
		$scope.creatingEMEAPDF = true;


		//  Load Google Bar Chart Visualization
		google.charts.load('current', {packages: ['corechart', 'bar']});
		google.charts.setOnLoadCallback(drawStuff);

		//Draw each Bar Chart
		function drawStuff() {

			// Determine the CSMs within each Region
			$scope.NACSMs = query.filterCSMS($scope.csms, {geo: 'North America'});
			$scope.LACSMs = query.filterCSMS($scope.csms, {geo: 'Latin America'});
			$scope.APCSMs = query.filterCSMS($scope.csms, {geo: 'Asia Pacific'});
			$scope.EMEACSMs = query.filterCSMS($scope.csms, {geo: 'EMEA'});

			// Determine the Clients within each Region
			$scope.NAClients = query.filterClients($scope.NACSMs, {status: 'current', date: new Date, removeDuplicates: false, removeOthers: true});
			$scope.LAClients = query.filterClients($scope.LACSMs, {status: 'current', date: new Date, removeDuplicates: false, removeOthers: true});
			$scope.APClients = query.filterClients($scope.APCSMs, {status: 'current', date: new Date, removeDuplicates: false, removeOthers: true});
			$scope.EMEAClients = query.filterClients($scope.EMEACSMs, {status: 'current', date: new Date, removeDuplicates: false, removeOthers: true});

			// Initialize each Geos DataTable
			$scope.CSMAmericasClientChart = new google.visualization.DataTable();
			$scope.CSMLAClientChart = new google.visualization.DataTable();
			$scope.CSMAPClientChart = new google.visualization.DataTable();
			$scope.CSMEMEAClientChart = new google.visualization.DataTable();

			// Draw North American Graph
			createGraph($scope.CSMAmericasClientChart, 'North America', $scope.NAClients, $scope.NACSMs);
			$scope.$apply(function () {
				// Disable Secondary Loader
				$scope.creatingNAPDF = false;
			});

			// Draw Latin America Graph
			createGraph($scope.CSMLAClientChart, 'Latin America', $scope.LAClients, $scope.LACSMs);
			$scope.$apply(function () {
				// Disable Secondary Loader
				$scope.creatingLAPDF = false;
			});

			// Draw Asia Pacific Graph
			createGraph($scope.CSMAPClientChart, 'Asia Pacific', $scope.APClients, $scope.APCSMs);
			$scope.$apply(function () {
				// Disable Secondary Loader
				$scope.creatingAPPDF = false;
			});

			// Draw EMEA Graph
			createGraph($scope.CSMEMEAClientChart, 'EMEA', $scope.EMEAClients, $scope.EMEACSMs);
			$scope.$apply(function () {
				// Disable Secondary Loader
				$scope.creatingEMEAPDF = false;
			});

		}

		// Get new data from ETA
		load.fetchFromETA();

		// Apply Changes
		$scope.$apply();
	});
	// End of drawChart()


	// Draws each individual Geo bar chart
	function createGraph(graph, region, clients, csms) {

		// Determine what the current region is
		var divRegion = '';
		if (region === 'North America') {
			divRegion = 'NorthAmerica';
		}
		else if(region === 'Latin America') {
			divRegion = 'LatinAmerica';
		}
		else if(region === 'Asia Pacific') {
			divRegion = 'AsiaPacific';
		}
		else {
			divRegion = 'EMEA';
		}



		// Add CSM column to datatable
		graph.addColumn('string', 'CSM');

		// Initialize CSM Name Array
		$scope.csmsNames = [];



		// Function to compare two values
		function compare(a,b) {
			if (a.csmName < b.csmName) {
				return -1;
			}
			if (a.csmName > b.csmName) {
				return 1;
			}
			return 0;
		}

		// Sort CSMs Alphabetically
		csms.sort(compare);

		// Determine the number of CSMs in the specified region
		var csmsInRegion = 0;
		for (var i = 0; i < csms.length; i++) {
			$scope.csmsNames.push(csms[i].csmName);
			console.log($scope.csmsNames[0]);
			csmsInRegion++;
		}

		// Initialize Client Array
		$scope.clientList = [];

		// Function to calculate height of each bar graph
		function calcHeight(csmsInRegion) {
			if (csmsInRegion < 20) {
				return '750px;'
			}
			else if (csmsInRegion < 30) {
				return 80*csmsInRegion;
			}
			else if (80*csmsInRegion > 1000) {
				return 1000;
			}
		}


		// Set of Functions to determine index of value in array
		// Each function compares a different value type

		// Function to determine if the client name exists in the client object array
		function arrayContainsClient(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].name === value) {
					return true;
				}
			}
			return false;
		}

		// Function to determine if the index of the client name in the client object array
		function getIndexArrayClient(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].name === value) {
					return i;
				}
			}
			return false;
		}

		// Function to determine if the value exists in the array
		function arrayContains(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === value) {
					return true;
				}
			}
			return false;
		}

		// Functiion to get index of the value in the array
		function getIndexArray(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === value) {
					return i;
				}
			}
			return false;
		}

		// Function to determine the index of the value in the array of Client objects
		// that are gathered directly from the CSM object, without filter
		function getIndexArrayGraph(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].clientName === value) {
					return i;
				}
			}
			return false;
		}


		// Draw each bar chart
		$scope.chartGeoBarChart = Highcharts.chart('csm' + divRegion + 'ClientChart', {
			chart: {
				type: 'bar',
				height: calcHeight(csmsInRegion)
			},
			title: {
				text: ''
			},
			xAxis: {
				categories: $scope.csmsNames,
				stackLabels: {
					enabled: true,
					style: {
						fontSize: '5px',
					}
				}
			},
			yAxis: {
				min: 0,
				minTickInterval: 20,
				title: {
					text: ''
				},
				plotLines: [{
					color: 'red', // Color value
					dashStyle: 'solid', // Style of the plot line. Default to solid
					value: 100, // Value of where the line will appear
					width: 2 // Width of the line
				}],

			},
			legend: {
				reversed: true,
				enabled: true,
				allowPointSelect: false,
				labelFormatter: function() {
					// do truncation here and return string
					// this.name holds the whole label
					if (this.name == 'relatedCSMWork') {
						return 'Other Work'
					}
					else if (this.name == 'clientTrial') {
						return 'Trial Client'
					}
					else if (this.name == 'Available') {
						return 'Available'
					}

					return 'Paid Client'
				}
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				series: {
					animation: false,
					stacking: 'normal',
					dataLabels: {
						enabled: true,
						formatter: function () {
							if (this.y == 0) {
								return null;
							}
							return this.series.name;
						}
					},
					events: {

						// Enables each bar on the chart to be clicked, and links to that client's account page
						// on ETA
						click: function (event) {

							var indexNA = library.contains(this.name, $scope.NAClients, "clientName");
							var indexLA = library.contains(this.name, $scope.LAClients, "clientName");
							var indexAP = library.contains(this.name, $scope.APClients, "clientName");
							var indexEMEA = library.contains(this.name, $scope.EMEAClients, "clientName");

							if (indexNA !== -1) {
								window.open(
									"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + $scope.NAClients[indexNA].accountID,
									'_blank'
								)
							}
							else if (indexLA !== -1) {
								window.open(
									"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + $scope.LAClients[indexLA].accountID,
									'_blank'
								)
							}
							else if (indexAP !== -1) {
								window.open(
									"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + $scope.APClients[indexAP].accountID,
									'_blank'
								)
							}
							else if (indexEMEA !== -1) {
								window.open(
									"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + $scope.EMEAClients[indexEMEA].accountID,
									'_blank'
								)
							}
						}
					}
				}
			},
		});


		// Add Client Work Series to Bar Chart
		$scope.chartGeoBarChart.addSeries({
			id: 'clientWork',
			name: 'clientWork',
			color: '#167F39',
		});

		// Add Trial Clients Series to Bar Chart
		$scope.chartGeoBarChart.addSeries({
			id: 'clientTrial',
			name: 'clientTrial',
			color: '#3E606F',
		});

		// Add Related CSM Work Series to Bar Chart
		$scope.chartGeoBarChart.addSeries({
			id: 'relatedCSMWork',
			name: 'relatedCSMWork',
			color: '#B1BF69',
		});


		// Determine each CSMs Available Capacity
		var csmsCap = new Array(csms.length);

		for (var i = 0; i < csms.length; i++) {
			var csmNameIndex = getIndexArray($scope.csmsNames, $scope.csms[i].csmName);
			if (csmNameIndex !== -1) {
				var avail = 100 - csms[i].assigned - csms[i].otherWork;
				csmsCap[i] = avail;
			}
			else {
				csmsCap[i] = 0;
			}
		}

		// Add Available Series to Bar Chart
		$scope.chartGeoBarChart.addSeries({
			name: 'Available',
			color: '#D9D9D9',
			data: csmsCap,
			tooltip: {
				valueSuffix: ' %'
			},
			dataLabels: {
				enabled: false,
			},
		});


		// Determine CSMs Other Work
		$scope.regionOtherWork = query.filterClients(csms, {status: 'current', date: new Date, onlyOthers: true});

		// Initialize Arrays of Client IDs, Names, and Other Work Titles
		$scope.clientIDs = new Array(clients.length);
		$scope.clientNames = new Array(clients.length);
		$scope.otherWorkNames = new Array($scope.regionOtherWork.length);


		// Assign Other Work values to each CSM based on ETA data
		for (var i = 0; i < clients.length; i++) {
			$scope.clientNames[i] = new Array(csms.length);
			if (i < $scope.regionOtherWork.length) {
				$scope.otherWorkNames[i] = new Array(csms.length);
			}
			for (var x = 0; x < csms.length; x++) {
				$scope.clientNames[i][x] = null;
				if (i < $scope.regionOtherWork.length) {
					$scope.otherWorkNames[i][x] = null;
				}
			}
		}

		// Add Other Work Series to Bar Chart for Each CSM
		for (var i in $scope.regionOtherWork) {

			var index = getIndexArray($scope.csmsNames, $scope.regionOtherWork[i].csm);

			$scope.otherWorkNames[i][index] = $scope.regionOtherWork[i].clientCapacity;

			// Add Other Work Series to Bar Chart for Each CSM
			$scope.chartGeoBarChart.addSeries({
				linkedTo: 'relatedCSMWork',
				name: $scope.regionOtherWork[i].clientName,
				color: '#B1BF69',
				data: $scope.otherWorkNames[i],
				tooltip: {
					valueSuffix: ' %'
				},
			});
		}

		// Add Paid Clients and Trial Clients Series to each CSM on the Bar Chart
		for (var i in clients) {
			$scope.clientIDs[i] = clients[i].accountID;

			var csmIndex = getIndexArray($scope.csmsNames, clients[i].csm);


			$scope.clientNames[i][csmIndex] += clients[i].clientCapacity;

			console.log(clients[i].clientCapacity)
			console.log(clients[i].clientName + ' ---- ' + $scope.clientNames[i][csmIndex] + ' ---' + clients[i].csm);
			// Add Trial Client Series
			if (clients[i].isTrial === 'trial') {
				$scope.chartGeoBarChart.addSeries({
					linkedTo: 'clientTrial',
					name: clients[i].clientName,
					color: '#3E606F',
					data: $scope.clientNames[i],
					tooltip: {
						valueSuffix: ' %'
					}
				});

			}
			else {
				// Add Paid Client Series
				$scope.chartGeoBarChart.addSeries({
					linkedTo: 'clientWork',
					name: clients[i].clientName,
					color: '#167F39',
					data: $scope.clientNames[i],
					tooltip: {
						valueSuffix: ' %'
					}
				});
			}
		}

	}
	// End of createGraph function

	// Initialize all pages to show
	$scope.filters = [true, true ,true, true];
	$scope.first = 0;

	// Toggle between making a page visible and hidden
	$scope.toggleView = function(view) {
		$scope.filters[view] = !$scope.filters[view];
	}

	// Determine which page is at the top
	$scope.first = function() {
		for(var i = 0; i < $scope.filters.length; i++) {
			if($scope.filters[i]) {
				return i;
			}
		}
	}

	// Print Function
	$scope.print = function() {
		window.print();
	}

	// Get current date as a formatted string
	$scope.getDate = function() {
		var date = new Date();
		return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
	}

	// Get current month and year as a formatted string
	$scope.getMonthandYear = function() {
		var date = new Date();
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
		return `${months[date.getMonth()]} ${date.getFullYear()}`
	}

});
