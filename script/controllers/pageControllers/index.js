CSMApp.controller("GeoOverviewController", function($scope, $http, load) {

	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// workEffort is used to determine whether to show 'Actual Utilization' or
	// 'Assigned Utilization'. If workEffort is true, it will show
	// 'Actual Utilization', and when false, will show 'Assigned Utilization'
	$scope.workEffort = true;


	//flipWorkEffort: Toggles between Assigned Utilization and Actual Utilization
	$scope.flipWorkEffort = function() {
		$scope.workEffort = !$scope.workEffort;
	}


	//openOverutilizedCSMReport: Opens the Overutilized CSM Report in a new tab
	$scope.openOverutilizedCSMReport = function() {
		window.open(
			'/Reports/OverutilizedCSMsReport',
			'_blank' // <- This is what makes it open in a new window.
		);
	}

	//Whenever the window is resized, the page will reload, allowing for the radial
	//graph to be redrawn to the appropriate size.
	$(window).resize(function(){location.reload();});


	//Popups for more information and/or instruction on what the toggle does
	$('#geoTitleNA')
	.popup();

	$('#geoTitleLA')
	.popup();

	$('#geoTitleEMEA')
	.popup();

	$('#geoTitleAP')
	.popup();

	$('.label')
	.popup();

	$('#radialCircle')
	.popup();

	$('#div1')
	.popup({
		target: '#utilizationLabel'
	});

	$('#div5')
	.popup({
		target: '#utilizationLabel'
	});

	$('#div4')
	.popup({
		target: '#utilizationLabelLA'
	});

	$('#div8')
	.popup({
		target: '#utilizationLabelLA'
	});

	$('#div2')
	.popup({
		target: '#utilizationLabelEMEA'
	});

	$('#div6')
	.popup({
		target: '#utilizationLabelEMEA'
	});

	$('#div3')
	.popup({
		target: '#utilizationLabelAP'
	});

	$('#div7')
	.popup({
		target: '#utilizationLabelAP'
	});

	$('#overutilizedStatLA')
	.popup();

	$('#overutilizedStatNA')
	.popup();

	$('#overutilizedStatEMEA')
	.popup();

	$('#overutilizedStatAP')
	.popup();

	//End of Popup initialization

	//screenWidth keeps track of the window size to accordingly draw
	//the statistics and graph
	$scope.screenWidth = window.innerWidth;

	//checkStatSize: Used to determine what the statistic group should be
	$scope.checkStatSize = function() {
		if ($scope.screenWidth < 1441) {
			return 'mini';
		}
		return 'small';
	}

	//checkNumStats: Used to determine what size each statistic should be
	$scope.checkNumStats = function() {
		if ($scope.screenWidth < 1440) {
			return 'one';
		}
		return 'two'
	}

	//checkMarginBottomRadial: Determines the margin-bottom for the radial graph
	$scope.checkMarginBottomRadial = function() {
		if ($scope.screenWidth < 1281) {
			return '-200px';
		}
		else if ($scope.screenWidth < 1441) {
			return '-300px';
		}
		return '-400px';
	}


	// html element that holds the chart
	$scope.viz_container;

	// our radial components and an array to hold them
	$scope.viz1,$scope.viz2,$scope.viz3,$scope.viz4,$scope.vizs=[];

	$scope.viz5, $scope.vizsWorkEffort=[];

	// our radial themes and an array to hold them
	$scope.theme1, $scope.theme2, $scope.theme3,$scope.themes;

	// our div elements we will put radials in
	$scope.div1, $scope.div2, $scope.div3, $scope.div4, $scope.divs;
	$scope.div5, $scope.div6, $scope.div7, $scope.div8, $scope.divsWorkEffort = [];


	//Here we want to animate the label value by capturing the tween event
	//that occurs when the component animates the value arcs.
	function onTween(viz,i) {
		viz.selection().selectAll(".vz-radial_progress-label")
		.text(viz.label()(viz.data() * i));
	}

	function onMouseOver(viz,d,i) {
		//We can capture mouse over events and respond to them
	}


	function onMouseOut(viz,d,i) {
		//We can capture mouse out events and respond to them
	}

	function onClick(viz,d,i) {
		//We can capture click events and respond to them
	}

	$scope.isLoading = true;


	//Get Data
	load.loadData()
	.then(function(data) {

		//Disable Loader once data is retrieved
		$scope.isLoading = false;

		$scope.csmList = data;

		//Function used to round numbers
		$scope.round = function (value, decimals) {
			return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		}


		//Assign Data to each region
		$scope.naData = query.filterCSMS($scope.csmList, {geo: "North America"});
		$scope.laData = query.filterCSMS($scope.csmList, {geo: "Latin America"});
		$scope.emeaData = query.filterCSMS($scope.csmList, {geo: "EMEA"});
		$scope.apData = query.filterCSMS($scope.csmList, {geo: "Asia Pacific"});

		$scope.northAmerica = {};
		$scope.northAmerica.totalCapacity = query.calculateCapacity($scope.naData);
		$scope.northAmerica.totalAssigned = query.calculateAssigned($scope.naData, new Date());
		$scope.northAmerica.utilization = $scope.round(query.calculateAssignedUtilization($scope.naData, new Date), 2);
		$scope.northAmerica.workEffortUtilization = $scope.round(query.calculateUtilization($scope.naData, new Date), 2);
		$scope.northAmerica.overutilized = query.filterCSMS($scope.naData, {isOverutilized: true});
		$scope.northAmerica.numberOverutilized = $scope.northAmerica.overutilized.length;
		$scope.northAmerica.workEffort = query.calculateWorkEffort($scope.naData, new Date());

		$scope.latinAmerica = {};
		$scope.latinAmerica.totalCapacity = query.calculateCapacity($scope.laData);
		$scope.latinAmerica.totalAssigned = query.calculateAssigned($scope.laData, new Date());
		$scope.latinAmerica.utilization = $scope.round(query.calculateAssignedUtilization($scope.laData, new Date), 2);
		$scope.latinAmerica.workEffortUtilization = $scope.round(query.calculateUtilization($scope.laData, new Date), 2);
		$scope.latinAmerica.overutilized = query.filterCSMS($scope.laData, {isOverutilized: true});
		$scope.latinAmerica.numberOverutilized = $scope.latinAmerica.overutilized.length;
		$scope.latinAmerica.workEffort = query.calculateWorkEffort($scope.laData, new Date());

		$scope.emea = {};
		$scope.emea.totalCapacity = query.calculateCapacity($scope.emeaData);
		$scope.emea.totalAssigned = query.calculateAssigned($scope.emeaData, new Date());
		$scope.emea.utilization = $scope.round(query.calculateAssignedUtilization($scope.emeaData, new Date), 2);
		$scope.emea.workEffortUtilization = $scope.round(query.calculateUtilization($scope.emeaData, new Date), 2);
		$scope.emea.overutilized = query.filterCSMS($scope.emeaData, {isOverutilized: true});
		$scope.emea.numberOverutilized = $scope.emea.overutilized.length;
		$scope.emea.workEffort = query.calculateWorkEffort($scope.emeaData, new Date());

		$scope.asiaPacific = {};
		$scope.asiaPacific.totalCapacity = query.calculateCapacity($scope.apData);
		$scope.asiaPacific.totalAssigned = query.calculateAssigned($scope.apData, new Date());
		$scope.asiaPacific.utilization = $scope.round(query.calculateAssignedUtilization($scope.apData, new Date), 2);
		$scope.asiaPacific.workEffortUtilization = $scope.round(query.calculateUtilization($scope.apData, new Date), 2);
		$scope.asiaPacific.overutilized = query.filterCSMS($scope.apData, {isOverutilized: true});
		$scope.asiaPacific.numberOverutilized = $scope.asiaPacific.overutilized.length;
		$scope.asiaPacific.workEffort = query.calculateWorkEffort($scope.apData, new Date());
		//End of Region Data Assignment



		//initialize: Draws Radial Graphs
		$scope.initialize = function() {

			//Determines width of screen
			$scope.numba = window.innerWidth;

			//Determines height of each radial graph
			$scope.numbaH = window.innerHeight/3;

			//Here we use the div tags from our HTML page to load the components into.
			$scope.div1 = d3.select("#div1");
			$scope.div2 = d3.select("#div2");
			$scope.div3 = d3.select("#div3");
			$scope.div4 = d3.select("#div4");

			$scope.div5 = d3.select("#div5");
			$scope.div6 = d3.select("#div6");
			$scope.div7 = d3.select("#div7");
			$scope.div8 = d3.select("#div8");
			//Store the divs in an array for easy access
			$scope.divs=[$scope.div1,$scope.div2,$scope.div3, $scope.div4];
			$scope.divsWorkEffort = [$scope.div5, $scope.div6, $scope.div7, $scope.div8];

			//Here we create our radial progress components by passing in a parent DOM element (our div tags)
			$scope.viz1 = vizuly.viz.radial_progress(document.getElementById("div1"));
			$scope.viz2 = vizuly.viz.radial_progress(document.getElementById("div2"));
			$scope.viz3 = vizuly.viz.radial_progress(document.getElementById("div3"));
			$scope.viz4 = vizuly.viz.radial_progress(document.getElementById("div4"));

			$scope.vizs=[$scope.viz1,$scope.viz2,$scope.viz3, $scope.viz4];

			$scope.viz5 = vizuly.viz.radial_progress(document.getElementById("div5"));
			$scope.viz6 = vizuly.viz.radial_progress(document.getElementById("div6"));
			$scope.viz7 = vizuly.viz.radial_progress(document.getElementById("div7"));
			$scope.viz8 = vizuly.viz.radial_progress(document.getElementById("div8"));

			//Store the vizs in an array for easy access
			$scope.vizsWorkEffort=[$scope.viz5,$scope.viz6, $scope.viz7, $scope.viz8];

			//Here we create three vizuly themes for each radial progress component.
			//A theme manages the look and feel of the component output.  You can only have
			//one component active per theme, so we bind each theme to the corresponding component.


			//Assign a colour theme to the 'Assigned Utilization' Radial Graphs
			$scope.theme1 = vizuly.theme.radial_progress($scope.viz1).skin(vizuly.skin.RADIAL_PROGRESS_NEON);
			$scope.theme2 = vizuly.theme.radial_progress($scope.viz2).skin(vizuly.skin.RADIAL_PROGRESS_NEON);
			$scope.theme3 = vizuly.theme.radial_progress($scope.viz3).skin(vizuly.skin.RADIAL_PROGRESS_NEON);
			$scope.theme4 = vizuly.theme.radial_progress($scope.viz4).skin(vizuly.skin.RADIAL_PROGRESS_NEON);

			//Assign a colour theme to the 'Actual Utilization' Radial Graphs, based on Actual Utilization
			if ($scope.northAmerica.workEffortUtilization > 100) {
				$scope.theme1 = vizuly.theme.radial_progress($scope.viz5).skin(vizuly.skin.RADIAL_PROGRESS_FIRE);
			}
			else if ($scope.northAmerica.workEffortUtilization  === 100) {
				$scope.theme1 = vizuly.theme.radial_progress($scope.viz5).skin(vizuly.skin.RADIAL_PROGRESS_ALERT);
			}
			else {
				$scope.theme1 = vizuly.theme.radial_progress($scope.viz5).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS);
			}

			if ($scope.emea.workEffortUtilization  > 100) {
				$scope.theme2 = vizuly.theme.radial_progress($scope.viz6).skin(vizuly.skin.RADIAL_PROGRESS_FIRE);
			}
			else if ($scope.emea.workEffortUtilization  === 100) {
				$scope.theme2 = vizuly.theme.radial_progress($scope.viz6).skin(vizuly.skin.RADIAL_PROGRESS_ALERT);
			}
			else {
				$scope.theme2 = vizuly.theme.radial_progress($scope.viz6).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS);
			}

			if ($scope.asiaPacific.workEffortUtilization  > 100) {
				$scope.theme3 = vizuly.theme.radial_progress($scope.viz7).skin(vizuly.skin.RADIAL_PROGRESS_FIRE);
			}
			else if ($scope.asiaPacific.workEffortUtilization  === 100) {
				$scope.theme3 = vizuly.theme.radial_progress($scope.viz7).skin(vizuly.skin.RADIAL_PROGRESS_ALERT);
			}
			else {
				$scope.theme3 = vizuly.theme.radial_progress($scope.viz7).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS);
			}

			if ($scope.latinAmerica.workEffortUtilization > 100) {
				$scope.theme4 = vizuly.theme.radial_progress($scope.viz8).skin(vizuly.skin.RADIAL_PROGRESS_FIRE);
			}
			else if ($scope.latinAmerica.workEffortUtilization === 100) {
				$scope.theme4 = vizuly.theme.radial_progress($scope.viz8).skin(vizuly.skin.RADIAL_PROGRESS_ALERT);
			}
			else {
				$scope.theme4 = vizuly.theme.radial_progress($scope.viz8).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS);
			}

			$scope.themes=[$scope.theme1,$scope.theme2,$scope.theme3, $scope.theme4];
			//End of Colour Assignment

			//Like D3 and jQuery, vizuly uses a function chaining syntax to set component properties
			//Here we set some bases line properties for all three components.

			//Set Width and Height of each Radial Graph
			$scope.vizs.forEach(function (viz,i) {
				viz.height($scope.numbaH)         // Height of component - radius is calculated automatically for us
				.min(0)                         // min value
				.max(100)                       // max value
				.capRadius(1)                   // Sets the curvature of the ends of the arc.
				.on("tween",onTween)            // On the arc animation we create a callback to update the label
				.on("mouseover",onMouseOver)    // mouseover callback - all viz components issue these events
				.on("mouseout",onMouseOut)      // mouseout callback - all viz components issue these events
				.on("click",onClick);
			})

			$scope.vizsWorkEffort.forEach(function (viz,i) {
				viz.height($scope.numbaH)         // Height of component - radius is calculated automatically for us
				.min(0)                         // min value
				.max(100)                       // max value
				.capRadius(1)                   // Sets the curvature of the ends of the arc.
				.on("tween",onTween)            // On the arc animation we create a callback to update the label
				.on("mouseover",onMouseOver)    // mouseover callback - all viz components issue these events
				.on("mouseout",onMouseOut)      // mouseout callback - all viz components issue these events
				.on("click",onClick);
			})
			//End of Width and Height Assignments

			// Now we set some unique properties for all three components to demonstrate the different settings.

			//Assign Data and Labels to each radial graph
			$scope.vizs[0]
			.data($scope.northAmerica.utilization)
			.startAngle(180)                         // Angle where progress bar starts
			.endAngle(180)                           // Angle where the progress bar stops
			.arcThickness(.1)                        // The thickness of the arc (ratio of radius)
			.label(function (d,i) { return d3.format(".04r")(d) + "%"; });

			$scope.vizs[1]
			.data($scope.emea.utilization)
			.startAngle(180)
			.endAngle(180)
			.arcThickness(.1)
			.label(function (d,i) { return d3.format(".04r")(d) + "%"; });

			$scope.vizs[2]
			.data($scope.asiaPacific.utilization)
			.startAngle(180)
			.endAngle(180)
			.arcThickness(.1)

			.label(function (d,i) { return d3.format(".04r")(d) + "%"});

			$scope.vizs[3]
			.data($scope.latinAmerica.utilization)
			.startAngle(180)
			.endAngle(180)
			.arcThickness(.1)

			.label(function (d,i) { return d3.format(".04r")(d) + "%"});

			$scope.vizsWorkEffort[0]
			.data($scope.northAmerica.workEffortUtilization)
			.startAngle(180)                         // Angle where progress bar starts
			.endAngle(180)                           // Angle where the progress bar stops
			.arcThickness(.1)                        // The thickness of the arc (ratio of radius)
			.label(function (d,i) { return d3.format(".04r")(d) + "%"; });

			$scope.vizsWorkEffort[1]
			.data($scope.emea.workEffortUtilization)
			.startAngle(180)
			.endAngle(180)
			.arcThickness(.1)
			.label(function (d,i) { return d3.format(".04r")(d) + "%"; });

			$scope.vizsWorkEffort[2]
			.data($scope.asiaPacific.workEffortUtilization)
			.startAngle(180)
			.endAngle(180)
			.arcThickness(.1)

			.label(function (d,i) { return d3.format(".04r")(d) + "%"});

			$scope.vizsWorkEffort[3]
			.data($scope.latinAmerica.workEffortUtilization)
			.startAngle(180)
			.endAngle(180)
			.arcThickness(.1)
			.label(function (d,i) { return d3.format(".04r")(d) + "%"});
			//End of Data and Label Assignment

			//Determine the width of the radial div element
			$scope.divWidth = $scope.numba * 1 / 4;

			//Assign a width, height, and radius to each Radial Graph
			$scope.divs.forEach(function (div,i) {
				div.style("width", $scope.divWidth + 'px')
				$scope.vizs[i].width($scope.divWidth).height($scope.divWidth).radius($scope.numbaH/2.2).update();
				$scope.vizsWorkEffort[i].width($scope.divWidth).height($scope.divWidth).radius($scope.numbaH/2.2).update();
			})

		}
		//End of Initialize function

		//Draw the Radial Graphs
		$scope.initialize();


		//percentage: Used to toggle statistics between CSM based calculation and Contract
		//based calculation
		$scope.percentage = true;

		//Get new data from ETA
		load.fetchFromETA();
	});
});
