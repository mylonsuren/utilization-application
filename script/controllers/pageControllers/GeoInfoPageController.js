CSMApp.controller("GeoInfoPageController", function($scope, $http, load) {

	//this is a plugin that sorts the tables in alpha order
	$('#clientTable').tablesort();
	$('thead th.float').data('sortBy', function(th, td, tablesort) {
		return parseFloat(td.text());
	});

	//initialize semantic UI popups. Check out documentation on semantic-ui.com
	$('#geoCapacity').popup();
	$('#geoAssignment').popup();
	$('.info.circle.icon').popup();

	//table to translate ETA short names for markets into their full names
	$scope.markets = {
		"anz" : "A/NZ",
		"asean" : "ASEAN",
		"ap" : "Asia Pacific",
		"benelux" : "BeNeLux",
		"br" : "Brazil",
		"cee" : "CEE",
		"dach" : "DACH",
		"eu" : "Europe",
		"fr" : "France",
		"gcg" : "GCG",
		"isa" : "ISA",
		"it" : "Italy",
		"jp" : "Japan",
		"korea" : "Korea",
		"la" : "Latin America",
		"mea" : "MEA",
		"mx" : "Mexico",
		"nacan" : "NA Canada Market",
		"nacomm" : "NA Communications Market",
		"nadist" : "NA Distribution Market",
		"nafed" : "NA Federal Market",
		"nafss" : "NA FSS Market",
		"naind" : "NA Industrial Market",
		"napub" : "NA Public Market",
		"nordics" : "Nordics",
		"na" : "North America",
		"spgi" : "SPGI",
		"ssa" : "SSA",
		"uki" : "UKI",
	};

	//import libraries
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	//pass in library functions into scope
	$scope.query = query;
	$scope.library = library;
	$scope.dates = dates;

	$scope.round = function (value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	//get name of region
	$scope.region = location.href.split('/').pop().replace(/-/g, " ");
	document.title = $scope.region;

	//get date
	$scope.date = new Date();

	$scope.isLoading = true;

	load.loadData().then(function(data) {
		//filter out all CSMs for this region
		$scope.csms = query.filterCSMS(data, {geo: $scope.region});

		$scope.allCSMS = data;

		//intialize work effort, capacity, assignments and utilization
		$scope.workEffort = query.calculateCSMWorkEffort($scope.csms);
		$scope.geoCapacity = query.calculateCapacity($scope.csms);
		$scope.geoAssignments = query.calculateAssigned($scope.csms, new Date());
		$scope.geoUtil = $scope.round(query.calculateAssignedUtilization($scope.csms, new Date()), 2);
		$scope.actualUtilization = $scope.round(query.calculateUtilization($scope.csms, new Date()), 2);

		//initialize clients list and contracts list
		$scope.clients = query.filterClients($scope.allCSMS, {geo:$scope.region, status: 'current', date: new Date(), removeDuplicates: true, removeOthers: true});
	   	$scope.contracts = query.filterClients($scope.csms, {geos: regions[$scope.region], removeOthers: true, status: 'current', date: new Date() });

	   	//initializate view
	   	$scope.selectedView = "Graph";
	   	$scope.timeDivision = "Month"; //time division is either "Month" or "Quarter"
	   	$scope.xLabelStart = new Date(); //this keeps track of which month the x axis should start on

		//this variable keeps track of the labels on the x axis. By default, the x axis starts on the current data and goes for 12 months.
	   	$scope.xAxisLabels = dates.generateXAxisLabels({start: $scope.xLabelStart, months: 12});

	   	//initialize chart data. Look at Chart.js documentation for line graph
		/*this controller uses a library called tc-angular-chartjs. This library connects Chart.js to Angular.js.
		$scope.data is passed into the chart-data in the canvas tag in GeoInfoPage.html.
		Therefore, whenever $scope.data changes, the view gets updated. */
	   	$scope.data = {
		   labels: $scope.xAxisLabels[$scope.timeDivision],
		   datasets: [
			   {
				   label: "Capacity",
				   fill: false,
				   lineTension: 0,
				   borderColor: "#418AF0",
				   borderCapStyle: 'butt',
				   borderDash: [],
				   borderDashOffset: 0.0,
				   borderJoinStyle: 'miter',
				   pointBorderColor: "#418AF0",
				   pointBackgroundColor: "#fff",
				   pointBorderWidth: 1,
				   pointHoverRadius: 5,
				   pointHoverBackgroundColor: "#418AF0",
				   pointHoverBorderColor: "#418AF0",
				   pointHoverBorderWidth: 2,
				   pointRadius: 2,
				   pointHitRadius: 0,
				   data: calculateData($scope.xLabelStart, 'capacity', $scope.timeDivision, 12), //calculate data points for capacity
				   spanGaps: false,
			   },
			   {
				   label: "Assigned",
				   fill: false,
				   lineTension: 0,
				   borderColor: 'rgba(92,193,120,1)',
				   borderCapStyle: 'butt',
				   borderDash: [],
				   borderDashOffset: 0.0,
				   borderJoinStyle: 'miter',
				   pointBorderColor: 'rgba(92,193,120,1)',
				   pointBackgroundColor: "#fff",
				   pointBorderWidth: 1,
				   pointHoverRadius: 5,
				   pointHoverBackgroundColor: 'rgba(92,193,120,1)',
				   pointHoverBorderColor: 'rgba(92,193,120,1)',
				   pointHoverBorderWidth: 2,
				   pointRadius: 2.5,
				   pointHitRadius: 10,
				   data: calculateData($scope.xLabelStart, 'assigned', $scope.timeDivision, 12), //calculate data points for assignments
				   spanGaps: false,
			   },
			   {
				   label: "Work Effort",
				   fill: false,
				   lineTension: 0,
				   borderColor: 'rgba(251,45,8,1)',
				   borderCapStyle: 'butt',
				   borderDash: [],
				   borderDashOffset: 0.0,
				   borderJoinStyle: 'miter',
				   pointBorderColor: 'rgba(251,45,8,1)',
				   pointBackgroundColor: "#fff",
				   pointBorderWidth: 1,
				   pointHoverRadius: 5,
				   pointHoverBackgroundColor: 'rgba(251,45,8,1)',
				   pointHoverBorderColor: 'rgba(251,45,8,1)',
				   pointHoverBorderWidth: 2,
				   pointRadius: 2.5,
				   pointHitRadius: 10,
				   data: new Array(12).fill($scope.workEffort), //draw a straight line for work effort (because we do not have work effort data that varies by month)
				   spanGaps: false,
			   }

		   ]
	   };

	   //options for the line graph. Check out Chart.js documentation
	   /*this controller uses a library called tc-angular-chartjs. This library connects Chart.js to Angular.js.
	   $scope.options is passed into the chart-options in the canvas tag in GeoInfoPage.html.
	   Therefore, whenever $scope.options changes, the view gets updated */
	   $scope.options = {
		   legend : {
			   display: true,
			   position: "top"
		   },
		   scales: {
			   yAxes: [{
				   scaleLabel : {
					   display : true,
					   labelString : "Percentage %",
						 fontColor: "white"
				   },
				   ticks : {
					   beginAtZero: true,
						 fontColor:"white"
				   },
					 gridLines:{
						 color: "#1A5C7D"
					 }
			   }],
			   xAxes: [{
				   scaleLabel : {
					   display: true,
					   labelString: $scope.timeDivision,
						 fontColor: "white"
				   },
					 gridLines:{
						 color: "#1A5C7D"
					 },
					 ticks : {
						 fontColor:"white"
					 }
			   }]
		   },
	   };

	   $scope.units = true; //this variable controllers which units the capacity and work effort are shown in. true represents units of subscription, false represents units of # of csms
	   $scope.isLoading = false; //turn off loader

	   load.fetchFromETA(); //fetch data from ETA once the view has loaded
	});

	function calculateData(start, type, timeDivision, months, quarters) {
		//this function calculates data for 12 months or 6 quarters, depending on which view is selected
		//start is the start date, passed as a Javascript Date Object
		//type can either be 'assigned' or 'capacity'
		//months is the number of months that data should be calculated for
		//quarters is the number of quarters that data should be calculated for
		var month = start.getMonth();
		var year = start.getFullYear();

		var values = [];

		if(timeDivision === 'Month') {
			for(var i = month; i < month + months; i++) {
				date = new Date();
				date.setFullYear(year);
				date.setMonth(i);
				if(type === 'assigned')
					values.push(query.calculateAssigned($scope.csms, date));
				else if(type === 'capacity')
					values.push(query.calculateCapacity($scope.csms, date))

			}
		} else if(timeDivision === 'Quarter') {
			for(var i = month; i < month + months; i++) {
				date = new Date();
				date.setFullYear(year);
				date.setMonth(i);
				if(date.getMonth() % 3 === 0) {
					if(type === 'assigned')
						values.push(query.calculateAssigned($scope.csms, date));
					else if(type === 'capacity')
						values.push(query.calculateCapacity($scope.csms, date))
				}

			}
		}

		return values;
	}

	$scope.changeTimeDivision = function(division) {
		//this function is called when someone presses either the "Month" or "Quarter" button
		//division refers to which button was pressed, where division === 'Month' if the 'Month' button was pressed and division === 'Quarter' if the 'Quarter' button was pressed
		if($scope.timeDivision !== division) {
			$scope.timeDivision = division; //change time divsion
			$scope.data.labels = $scope.xAxisLabels[division]; //change xAxisLabels
			$scope.options.scales.xAxes[0].scaleLabel.labelString = division; //change xAxis label
			$scope.data.datasets[0].data = calculateData($scope.xLabelStart, 'capacity', division, 12); //recalculate capacity data
			$scope.data.datasets[1].data = calculateData($scope.xLabelStart, 'assigned', division, 12); //recalculate assignment data
		}
	}

	$scope.moveGraph = function(direction) {
		//this function is called whenever someone presses the 'forward' or 'backward' button on the graph

		//turn off animations on the graph
	   	$scope.options.animation = false;

		//when the graph is moved, the $scope.xLabelStart variable must change, depending on whether the view is months or quarters
	   	if($scope.timeDivision === 'Month') {
			if(direction === 'forward')  $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() + 1);
		   	else if(direction === 'backward') $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() - 1);
	   	} else if($scope.timeDivision === 'Quarter') {
		   	if(direction === 'forward') $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() + 3);
		   	else if(direction === 'backward') $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() - 3);
	   	}

		//once the $scope.xLabelStart is updated, recalculate all of the required data
	   	$scope.xAxisLabels = dates.generateXAxisLabels({start: $scope.xLabelStart, months: 12}); //generate x axis labels from the new starting point
	   	$scope.data.labels = $scope.xAxisLabels[$scope.timeDivision]; //set the x axis labels (setting $scope.data will automatically update the view)
	   	$scope.data.datasets[0].data = calculateData($scope.xLabelStart, 'capacity', $scope.timeDivision, 12);
	   	$scope.data.datasets[1].data = calculateData($scope.xLabelStart, 'assigned', $scope.timeDivision, 12);
   }

	$scope.calculateUtilization = function(value1, value2) {
		return library.calculatePercent(value1, value2, 2);
	}

	//take the csm name and put a hyphen through the spaces so it can show up properly on the url
	$scope.csmUrl = function(csm){
		return csm.csmName.replace(/ /g, '-');
	}
});
