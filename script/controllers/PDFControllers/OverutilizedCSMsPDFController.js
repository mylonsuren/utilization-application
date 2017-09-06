
CSMApp.controller("OverutilizedCSMsPDFController", function($scope, $http, $timeout, load) {

	//Initialize Loader
	$scope.isLoading = true;

	//Library
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	//Get Data
	load.loadData().then(function(data) {

		//Gather CSM Data
		$scope.csmList = data;

		//Determine Overutilized CSMs
		$scope.overUtilizedCSMS = query.filterCSMS($scope.csmList, {isOverutilized: true});

		//Initialize Arrays
		$scope.csmsNames = [];
		$scope.csmsAssigned = [];
		$scope.csmsCap = [];
		$scope.csmsWorkEffort = [];

		//Push data to appropriate array
		for (var i = 0; i < $scope.overUtilizedCSMS.length; i++) {
			console.log($scope.overUtilizedCSMS[i].csmName)
			$scope.csmsNames.push($scope.overUtilizedCSMS[i].csmName);
			$scope.csmsAssigned.push($scope.overUtilizedCSMS[i].assigned);
			$scope.csmsWorkEffort.push($scope.overUtilizedCSMS[i].workEffort);
			$scope.csmsCap.push($scope.overUtilizedCSMS[i].csmCapacity);
		}

		//Initialize and draw Overutilized CSMs Graph
		$scope.overutilzedCSMChart = Highcharts.chart('overutilzedCSMChart', {
			chart: {
				type: 'bar',
				height: $scope.overUtilizedCSMS.length * 200
			},
			title: {
				text: ' ',
				position: 'none'
			},
			xAxis: {
				categories: [],
				labels: {
					overflow: 'justify'
				}
			},
			credits: {
				enabled: false,
			},
			yAxis: [{
				min: 0,
				title: {
					text: 'Percent Utilized'
				},
				plotLines: [{
					color: 'red', // Color value
					dashStyle: 'solid', // Style of the plot line. Default to solid
					value: 100, // Value of where the line will appear
					width: 2 // Width of the line
				}],

			}],
			legend: {
				shadow: false
			},
			tooltip: {
				shared: true,
			},
			plotOptions: {
				bar: {
					shadow: false,
					borderWidth: 0,

				},
				series: {
					dataLabels: {
						animation: false,
						enabled: true,
						inside: true,
						formatter: function() {
							return this.series.name + ': ' + this.y + '%'
						}
					},
					pointPadding: 0,
					groupPadding: 0.1,
				}
			},
		});

		//Set x-axis categories to CSM Names
		$scope.overutilzedCSMChart.xAxis[0].setCategories($scope.csmsNames);

		//Add series to graph (Work Effort, Assigned, and Capacity)
		$scope.overutilzedCSMChart.addSeries({
			name: 'Work Effort',
			color: 'rgba(192, 57, 43, .9)',
			data:   $scope.csmsWorkEffort,
			tooltip: {
				valueSuffix: ' %'
			}
		});
		$scope.overutilzedCSMChart.addSeries({
			name: 'Assigned',
			color: 'rgba(248,161,63,1)',
			data:   $scope.csmsAssigned,
			tooltip: {
				valueSuffix: ' %'
			}
		});
		$scope.overutilzedCSMChart.addSeries({
			name: 'Capacity',
			color: 'rgba(46, 134, 193, 1)',
			data:   $scope.csmsCap,
			tooltip: {
				valueSuffix: ' %'
			}
		});

		//Disable Loader
		$scope.isLoading = false;

		//Apply changes and methods
		$scope.$apply();

		//Get new data from ETA
		load.fetchFromETA();

	});


	//Link to respective CSM Info Page
	$scope.relocate = function(item) {
		location.href = '/CSM/' + item.name.replace(/ /g, "-");
	}

	//Get today's month and year
	$scope.getMonthandYear = function() {
		var date = new Date();
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
		return `${months[date.getMonth()]} ${date.getFullYear()}`
	}

	//Round numbers
	$scope.round = function (value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	//Print function
	$scope.print = function() {
		window.print();
	}

	//Redirect client to appropriate account page on ETA
	$scope.redirect = function(id) {
		if (id !== undefined) {
			window.open(
				"https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
				'_blank'
			)
		}
	}


});
