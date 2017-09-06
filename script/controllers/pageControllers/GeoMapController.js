CSMApp.controller("GeoMapController", function($scope, $http, load) {

	$scope.view = location.href.split('/').pop();

	// show loader
	$scope.isLoading = true;

	// load google charts visualization
	google.charts.load('current', {'packages':['geochart', 'table']});

	// library of functions
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// available screen width
	$scope.screenWidth = window.innerWidth;

	// refresh page when window is resized
	$(window).resize(function(){location.reload();});

	// determine size of utilization header
	$scope.checkHeaderSize = function() {
		if ($scope.screenWidth < 1281) {
			return 'tiny';
		}
		else if ($scope.screenWidth < 1441){
			return 'small';
		}
		else {
			return '';
		}
	}

	// determine size of utilization numbers
	$scope.checkStatSize = function() {
		if ($scope.screenWidth < 1281) {
			return 'mini';
		}
		else if ($scope.screenWidth < 1441){
			return 'tiny';
		}
		else {
			return 'small';
		}
	}

	// determine color of utiliation numbers
	$scope.checkStatColor = function(assignedUtil, actualUtil) {
		if ($scope.actualUtilization) {
			if (actualUtil > 100) {
				return 'red';
			}
		}
		else {
			if (assignedUtil > 100) {
				return 'red';
			}
		}
		return '';
	}


	// function to round numbers
	$scope.round = function (value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	// Initialize Popup with prompt to click to toggle
	$('#statsHeader')
	.popup()
	;

	$scope.dates = dates;

	//used to toggle between actual utilization and assigned utilization
	$scope.actualUtilization = true;


	load.loadData().then(function(data) {

		//Hide loader
		$scope.isLoading = false;

		// Gather data
		$scope.csms = data;

		// Get Geo data
		$scope.na = query.filterCSMS($scope.csms, {geo: "North America"});
		$scope.la = query.filterCSMS($scope.csms, {geo: "Latin America"});
		$scope.emea = query.filterCSMS($scope.csms, {geo: "EMEA"});
		$scope.ap = query.filterCSMS($scope.csms, {geo: "Asia Pacific"});

		$scope.laUtil = $scope.round(query.calculateAssignedUtilization($scope.la, new Date), 2);
		$scope.naUtil = $scope.round(query.calculateAssignedUtilization($scope.na, new Date), 2);
		$scope.emeaUtil = $scope.round(query.calculateAssignedUtilization($scope.emea, new Date), 2);
		$scope.apUtil = $scope.round(query.calculateAssignedUtilization($scope.ap, new Date), 2);


		$scope.laActualUtil = $scope.round(query.calculateUtilization($scope.la, new Date), 2);
		$scope.naActualUtil = $scope.round(query.calculateUtilization($scope.na, new Date), 2);
		$scope.emeaActualUtil = $scope.round(query.calculateUtilization($scope.emea, new Date), 2);
		$scope.apActualUtil = $scope.round(query.calculateUtilization($scope.ap, new Date), 2);


		google.charts.setOnLoadCallback(drawRegionsWorldMap);


		// Draw Map
		function drawRegionsWorldMap() {
			// Assigned Utilization
			$scope.dataGeoClient = new google.visualization.DataTable();
			$scope.dataGeoClient.addColumn('string', 'Region Code');
			$scope.dataGeoClient.addColumn('string', 'Geo');
			$scope.dataGeoClient.addColumn('number', 'Utilization');

			// Actual Utiliation
			$scope.dataGeoActual = new google.visualization.DataTable();
			$scope.dataGeoActual.addColumn('string', 'Region Code');
			$scope.dataGeoActual.addColumn('string', 'Geo');
			$scope.dataGeoActual.addColumn('number', 'Utilization');

			// Assigned Utilization
			$scope.dataGeoClient.addRows([
				//North America
				['021', 'North America', {v: Number($scope.naUtil), f: Number($scope.naUtil) + "%"}], //0

				// Latin America
				['029', 'Latin America', {v: Number($scope.laUtil), f: Number($scope.laUtil) + "%"}], //1
				['005', 'Latin America', {v: Number($scope.laUtil), f: Number($scope.laUtil) + "%"}],
				['013', 'Latin America', {v: Number($scope.laUtil), f: Number($scope.laUtil) + "%"}],

				// EMEA
				['154', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}], //4
				['155', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['151', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['039', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['015', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['011', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['017', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['014', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['018', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],
				['145', 'EMEA', {v: Number($scope.emeaUtil), f: Number($scope.emeaUtil) + "%"}],

				// Asia Pacific
				['143', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}], //14
				['030', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],
				['034', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],
				['035', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],
				['053', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],
				['054', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],
				['057', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],
				['061', 'Asia-Pacific', {v: Number($scope.apUtil), f: Number($scope.apUtil) + "%"}],

			]);

			// Actual Utilization
			$scope.dataGeoActual.addRows([
				// North America
				['021', 'North America', {v: Number($scope.naActualUtil), f: Number($scope.naActualUtil) + "%"}], //0

				// Latin America
				['029', 'Latin America', {v: Number($scope.laActualUtil), f: Number($scope.laActualUtil) + "%"}], //1
				['005', 'Latin America', {v: Number($scope.laActualUtil), f: Number($scope.laActualUtil) + "%"}],
				['013', 'Latin America', {v: Number($scope.laActualUtil), f: Number($scope.laActualUtil) + "%"}],

				// EMEA
				['154', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}], //4
				['155', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['151', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['039', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['015', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['011', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['017', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['014', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['018', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],
				['145', 'EMEA', {v: Number($scope.emeaActualUtil), f: Number($scope.emeaActualUtil) + "%"}],

				// Asia Pacific
				['143', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}], //14
				['030', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
				['034', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
				['035', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
				['053', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
				['054', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
				['057', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
				['061', 'Asia-Pacific', {v: Number($scope.apActualUtil), f: Number($scope.apActualUtil) + "%"}],
			]);


			// Determine color scheme for map
			// Colors are based on highest and lowest utilization, and the dividing points between Colors
			// are evenly split between these two numbers
			$scope.utils = [$scope.apUtil, $scope.emeaUtil, $scope.naUtil, $scope.laUtil];
			$scope.greatestUtil = Math.max(...$scope.utils);
			$scope.lowestUtil = Math.min(...$scope.utils);

			$scope.utilAvg = ($scope.greatestUtil - $scope.lowestUtil)/5;

			$scope.legendUtil = [];

			$scope.legendUtil[0] = $scope.lowestUtil + $scope.utilAvg;
			$scope.legendUtil[1] = $scope.lowestUtil + ($scope.utilAvg*2);
			$scope.legendUtil[2] = $scope.lowestUtil + ($scope.utilAvg*3);
			$scope.legendUtil[3] = $scope.lowestUtil + ($scope.utilAvg*4);

			var highestColor = '';
			var secondHighestColor = '';
			var thirdHighestColor = '';
			if ($scope.greatestUtil <= 100) {
				secondHighestColor = '#75A115';
				highestColor = '#335C1D';
				thirdHighestColor = '#9C9962';
			}
			else {
				secondHighestColor = '#D95B0F';
				highestColor = '#993115';
				thirdHighestColor = '#75A115';
			}

			// Configuration options for map
			$scope.options_geo = {
				resolution: 'subcontinents',

				domain: 'IN',
				region: 'world',
				colorAxis: {
					values: [
						$scope.lowestUtil, $scope.legendUtil[0],
						$scope.legendUtil[0], $scope.legendUtil[1],
						$scope.legendUtil[1], $scope.legendUtil[2],
						$scope.legendUtil[2], $scope.legendUtil[3],
						$scope.legendUtil[3], $scope.greatestUtil
					],

					colors: [
						'#BDB04E', '#BDB04E',
						'#A18851', '#A18851',
						thirdHighestColor, thirdHighestColor,
						secondHighestColor, secondHighestColor,
						highestColor, highestColor

					],
				},
				datalessRegionColor: '#B3B6B7',
				backgroundColor: '#2B848C',
				tooltip: {
					isHtml: true,
					trigger: 'focus'
				},
				height: window.innerHeight - 45, //45 is the height of the navbar
				width: window.innerWidth
			};

			// Determine color scheme for map
			// Colors are based on highest and lowest utilization, and the dividing points between Colors
			// are evenly split between these two numbers
			$scope.actualUtils = [$scope.apActualUtil, $scope.emeaActualUtil, $scope.naActualUtil, $scope.laActualUtil];
			$scope.greatestActualUtil = Math.max(...$scope.actualUtils);
			$scope.lowestActualUtil = Math.min(...$scope.actualUtils);

			$scope.utilActualAvg = ($scope.greatestActualUtil - $scope.lowestActualUtil)/5;

			$scope.legendActualUtil = [];

			$scope.legendActualUtil[0] = $scope.lowestActualUtil + $scope.utilActualAvg;
			$scope.legendActualUtil[1] = $scope.lowestActualUtil + ($scope.utilActualAvg*2);
			$scope.legendActualUtil[2] = $scope.lowestActualUtil + ($scope.utilActualAvg*3);
			$scope.legendActualUtil[3] = $scope.lowestActualUtil + ($scope.utilActualAvg*4);

			var highestActualColor = '';
			var secondHighestActualColor = '';
			var thirdHighestActualColor = '';
			if ($scope.greatestActualUtil <= 100) {
				secondHighestActualColor = '#75A115';
				highestActualColor = '#335C1D';
				thirdHighestActualColor = '#9C9962';
			}
			else {
				secondHighestActualColor = '#D95B0F';
				highestActualColor = '#993115';
				thirdHighestActualColor = '#75A115';
			}

			// Configuration options for map
			$scope.optionsActualGeo = {
				resolution: 'subcontinents',

				domain: 'IN',
				region: 'world',
				colorAxis: {
					values: [
						$scope.lowestActualUtil, $scope.legendActualUtil[0],
						$scope.legendActualUtil[0], $scope.legendActualUtil[1],
						$scope.legendActualUtil[1], $scope.legendActualUtil[2],
						$scope.legendActualUtil[2], $scope.legendActualUtil[3],
						$scope.legendActualUtil[3], $scope.greatestActualUtil
					],
					colors: [
						'#BDB04E', '#BDB04E',
						'#A18851', '#A18851',
						thirdHighestActualColor, thirdHighestActualColor,
						secondHighestActualColor, secondHighestActualColor,
						highestActualColor, highestActualColor
					],
				},
				datalessRegionColor: '#B3B6B7',
				backgroundColor: '#2B848C',
				tooltip: {
					isHtml: true,
					trigger: 'focus'
				},
				height: window.innerHeight - 45, //45 is the height of the navbar
				width: window.innerWidth
			};


			// Connecting to html div in geopage.html
			$scope.chartClientGeo = new google.visualization.GeoChart(document.getElementById('clientGeo_div'));


			$scope.chartActualGeo = new google.visualization.GeoChart(document.getElementById('actualGeo_div'));


			// Drawing map
			$scope.chartClientGeo.draw($scope.dataGeoClient, $scope.options_geo);
			$scope.chartActualGeo.draw($scope.dataGeoActual, $scope.optionsActualGeo);


			// If Geo on map is selected, redirect to GeoInfoPage
			google.visualization.events.addListener($scope.chartClientGeo, 'select', function () {

				var selection = $scope.chartClientGeo.getSelection();
				var selectionCode = $scope.dataGeoClient.getValue(selection[0].row, 0);
				var geoSelected = $scope.dataGeoClient.getValue(selection[0].row, 1);

				if (geoSelected == 'North America' && selection.length > 0)
				window.open('/Geo/North-America', '_self');

				else if (geoSelected == 'Latin America' && selection.length > 0)
				window.open('/Geo/Latin-America', '_self');

				else if (geoSelected == 'EMEA' && selection.length > 0)
				window.open('/Geo/EMEA', '_self');

				else if (selection.length > 0)
				if (selection.length > 0) window.open('/Geo/Asia-Pacific', '_self');
			});


			google.visualization.events.addListener($scope.chartActualGeo, 'select', function () {

				var selection = $scope.chartActualGeo.getSelection();
				var selectionCode = $scope.dataGeoActual.getValue(selection[0].row, 0);
				var geoSelected = $scope.dataGeoActual.getValue(selection[0].row, 1);

				if (geoSelected == 'North America' && selection.length > 0)
				window.open('/Geo/North-America', '_self');

				else if (geoSelected == 'Latin America' && selection.length > 0)
				window.open('/Geo/Latin-America', '_self');

				else if (geoSelected == 'EMEA' && selection.length > 0)
				window.open('/Geo/EMEA', '_self');

				else if (selection.length > 0)
				if (selection.length > 0) window.open('/Geo/Asia-Pacific', '_self');
			});

		}

		// redraw map when window is resized
		$(window).resize(function(){
			drawRegionsWorldMap();
		});

		// get new data from eta
		load.fetchFromETA();
	});

});
