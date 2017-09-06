CSMApp.controller("CountryMapController", function($scope, $http, load) {
	/* =========================================================================
	This file controls a country-based map view. This view was deleted because
	Jim and other management thought this view was not necessary. This page was
	kept as an Easter Egg. If you type in /Country into the browser you will see
	this view.
	=========================================================================== */

	$scope.view = location.href.split('/').pop();

	//this loads the map from the Google Charts API
	google.charts.load('current', {'packages':['geochart', 'table']});

	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	$scope.isLoading = true;


	$scope.round = function (value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	$scope.dates = dates;

	document.getElementById('sidebar').style.height = ((window.innerHeight - 50)+ 'px');

	$scope.cssClassNames = {
		'headerRow': 'headerRow',
		'tableRow': 'evenTableRow',
		'oddTableRow': 'oddTableRow',
		'selectedTableRow': 'orange-background large-font',
		'hoverTableRow': '',
		'headerCell': 'headerCell',
		'tableCell': 'tableText',
		'rowNumberCell': 'underline-blue-font'
	};

	$scope.csmUrl = function(csm){
		return csm.name.replace(/ /g, '-');
	}

	load.loadData().then(function(data) {
		var csmList = data;
		$scope.csms = query.filterCSMS(csmList, {});
		$scope.isLoading = false;

		$scope.numContractsCountry = [];
		$scope.countryList = [];
		for (var i = 0; i < $scope.csms.length; i++) {
			for (var x = 0; x < $scope.csms[i].clients.length; x++) {
				if ($scope.csms[i].clients[x].role !== 'Other' && (new Date($scope.csms[i].clients[x].clientStart) <= new Date()) && new Date($scope.csms[i].clients[x].clientEnd) >= new Date()) {
					if(!arrayContains($scope.countryList, $scope.csms[i].clients[x].country)) {
						$scope.countryList.push($scope.csms[i].clients[x].country);
						$scope.numContractsCountry.push(1)
					}
					else {
						var index = getIndexArray($scope.countryList, $scope.csms[i].clients[x].country);
						$scope.numContractsCountry[index]++;
					}
				}
			}
		}

		function arrayContains(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === value) {
					return true;
				}
			}
			return false;
		}

		function getIndexArray(arr, value) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === value) {
					return i;
				}
			}
			return -1;
		}



		google.charts.setOnLoadCallback(drawCountriesMap);
		function drawCountriesMap () {
			// COUNTRY MAP
			// Country Data
			$scope.dataClientCountry_Util = new google.visualization.DataTable();
			$scope.dataClientCountry_Util.addColumn('string', 'Country');
			$scope.dataClientCountry_Util.addColumn('number', 'Number of Contracts');



			for (var i = 0; i < $scope.countryList.length; i++) {
				$scope.dataClientCountry_Util.addRows([
					[$scope.countryList[i], $scope.numContractsCountry[i]]
				]);
			}


			$scope.highestContracts = Math.max(...$scope.numContractsCountry);
			$scope.lowestContracts = Math.min(...$scope.numContractsCountry);

			$scope.contractAvg = ($scope.highestContracts - $scope.lowestContracts)/5;

			$scope.legendContracts = [];

			$scope.legendContracts[0] = $scope.lowestContracts + $scope.contractAvg;
			$scope.legendContracts[1] = $scope.lowestContracts + ($scope.contractAvg*2);
			$scope.legendContracts[2] = $scope.lowestContracts + ($scope.contractAvg*3);
			$scope.legendContracts[3] = $scope.lowestContracts + ($scope.contractAvg*4);

			// Configuration options for map
			$scope.countryOptionsMap = {
				resolution: 'countries',
				domain: 'IN',
				colorAxis: {
					values: [
						$scope.lowestContracts, $scope.legendContracts[0],
						$scope.legendContracts[0], $scope.legendContracts[1],
						$scope.legendContracts[1], $scope.legendContracts[2],
						$scope.legendContracts[2], $scope.legendContracts[3],
						$scope.legendContracts[3], $scope.highestContracts],

						colors: [
							'#BDB04E', '#BDB04E',
							'#A18851', '#A18851',
							'#75A115', '#75A115',
							'#D95B0F', '#D95B0F',
							'#993115', '#993115'
						],
					},

					datalessRegionColor: '#B3B6B7',
					backgroundColor: '#2B848C',
					height: window.innerHeight - 45,
					width: window.innerWidth,
					tooltip: {
						trigger: 'focus'
					}
				};

				// Configuration options for table
				$scope.optionsTableCountry = {
					width: window.innerWidth*0.20,
					height: (window.innerHeight - 50) * 0.15,
					'cssClassNames': $scope.cssClassNames
				}
				// Connecting html div on geopage.html
				$scope.chartClient = new google.visualization.GeoChart(document.getElementById('clientCountry_div'));
				$scope.tableClient = new google.visualization.Table(document.getElementById('clientTable_div'));

				// Drawing Table and Map
				$scope.chartClient.draw($scope.dataClientCountry_Util, $scope.countryOptionsMap);
				$scope.tableClient.draw($scope.dataClientCountry_Util, $scope.optionsTableCountry);



				google.visualization.events.addListener($scope.chartClient, 'select', function(){
					selection = $scope.chartClient.getSelection();
					if(selection[0] === undefined){
						$('.sidebar').fadeOut('swing');
					}
					else{
						$scope.countrySelected = $scope.dataClientCountry_Util.getValue(selection[0].row, 0);
						$scope.clients = query.filterClients($scope.csms, {date: new Date(), status: 'current', country: $scope.countrySelected});
						$scope.$apply();
						$('.sidebar').fadeIn();
					}
				});

				// END OF COUNTRY MAP
			}

			$(window).resize(function(){
				drawCountriesMap();

			});
			document.getElementById('sidebar').style.height = ((window.innerHeight - 50)+ 'px');

		});

	});
