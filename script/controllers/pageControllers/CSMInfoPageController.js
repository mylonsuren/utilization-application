CSMApp.controller("CSMInfoPageController", function($scope, $http, $timeout, load) {

	//turn on loader
	$scope.isLoading = true;

	//import libraries from /script/libraries folder
	var query = new Query();
	var dates = new Dates();
	var library = new UsefulFunctions();

	//pass in libraries to $scope
	$scope.library = library;
	$scope.dates = dates;
	$scope.query = query;

	//get csm from the URL
	var csm = location.href.split('/').pop().replace(/-/g, " ");
	document.title = 'CSM Info - ' + csm;

	$scope.monthName = dates.monthName(new Date().getMonth());

	//current date
	var currentDate = new Date();

	//fetch all client names from ETA for the dropdown in the add Engagements modal
	$http.get('https://eta2-api.w3ibm.mybluemix.net/clients').then(function(object) {
		$scope.allClients = object.data.payload;
		$('.ui.fluid.search.selection.dropdown').dropdown(); //initialize the dropdown in the "Add Engagements" modal
	});

	//this function is used to calculate data for the line graph
	function calculateData(start, type, timeDivision, months, quarters) {
		//this function calculates data for 12 months or 6 quarters, depending on which view is selected
		//start is the start date, passed as a Javascript Date Object
		//type can either be 'assigned' or 'capacity'
		//months is the number of months that data should be calculated for
		//quarters is the number of quarters that data should be calculated for
		var csm = location.href.split('/').pop();
		var data = [$scope.csm];

		var month = start.getMonth();
		var year = start.getFullYear();

		var values = [];

		if(timeDivision === 'Month') {
			for(var i = month; i < month + months; i++) {
				date = new Date();
				date.setFullYear(year);
				date.setMonth(i);
				if(type === 'assigned')
				values.push(query.calculateAssigned(data, date));
				else if(type === 'capacity')
				values.push(query.calculateCapacity(data, date))

			}
		} else if(timeDivision === 'Quarter') {
			for(var i = month; i < month + months; i++) {
				date = new Date();
				date.setFullYear(year);
				date.setMonth(i);
				if(date.getMonth() % 3 === 0) {
					if(type === 'assigned')
					values.push(query.calculateAssigned(data, date));
					else if(type === 'capacity')
					values.push(query.calculateCapacity(data, date))
				}

			}
		}

		return values;
	}

	function initializeRadarGraphData() {
		//this function intializes the data set for the radar graph
		var size = $scope.currentClients.length;
		var capacityData = new Array(size);
		var workEffortData = new Array(size);
		var dataSet = {};
		for(var i = 0; i < size; i++) {
			capacityData[i] = $scope.currentClients[i].clientCapacity;
			workEffortData[i] = $scope.currentClients[i].percentTimeSpent;
		}

		dataSet['capacity'] = capacityData;
		dataSet['workEffort'] = workEffortData;
		return dataSet;
	}

	function createRadarLabels() {
		//this graph creates the labels for the radar graph based on the client names
		var size = $scope.currentClients.length;
		var labels = new Array(size);
		for(var i = 0; i < size; i++) {
			if($scope.currentClients[i].role == 'Other') {
				labels[i] = "Other Work";
			} else {
				labels[i] = $scope.currentClients[i].clientName;
			}
		}
		return labels;
	}

	//this function is used to determine the max y value of the utilization line graph
	function findMaxForGraph(arr, round) {
		//round refers to the scale of the graph (20 for line graph and 5 for radar graph)
		var max = 0;
		for (var i = 0; i < arr.length; i++ ){
			if(arr[i] > max) {
				max = arr[i];
			}
		}
		max = Math.ceil((max+5) / round) * round;//adds 5 and rounds number to round for better viewing
		return max;
	}

	function contentHtml(clientIndex, startDate, endDate) {
		//creates the HTML inside the bars for the timeline
		startDate.setDate(startDate.getDate() + 1);
		endDate.setDate(endDate.getDate() + 1);

		var startMonth = startDate.getMonth() + 1;
		var endMonth = endDate.getMonth() + 1;

		var startYear = startDate.getYear() - 100 + 2000;
		var endYear = endDate.getYear() - 100 + 2000;

		var startDay = startDate.getDate();
		var endDay = endDate.getDate();


		return '<td>' + $scope.clients[clientIndex].clientName.bold() + ' - ' + $scope.clients[clientIndex].role + '<br></td>' + '<td>Assignment: ' + $scope.clients[clientIndex].clientCapacity.toString().bold()+ '%</td>'
		+ '&nbsp&nbsp<td>Start Date: ' + dates.monthName(startMonth - 1, true).bold()+'-'+ startYear.toString() .bold()+ ' </td>&nbsp&nbsp' + '<td>End Date: '
		+ dates.monthName(endMonth - 1, true).bold() +'-'+ endYear.toString().bold() + '</td>';
	}

	function createCustomHTMLContent(clientIndex, startDate, endDate) {
		// Custom hover tooltips for timeline
		var startMonth = startDate.getMonth() + 1;
		var endMonth = endDate.getMonth() + 1;

		var startYear = startDate.getYear() - 100 + 2000;
		var endYear = endDate.getYear() - 100 + 2000;

		var startDay = startDate.getDate();
		var endDay = endDate.getDate();

		return '<div id="tooltipTime"><td>' + $scope.clients[clientIndex].clientName .bold()+ '</td>' + '<br><td>Role: ' + $scope.clients[clientIndex].role + '</td>' + '<br><td>Capacity: ' + $scope.clients[clientIndex].clientCapacity + '%</td>'
		+ '<br><td>Start Date: ' + startMonth +'/'+ startDay +'/'+ startYear +'</td>' + '<br><td>End Date: ' + endMonth +'/'+ endDay +'/'+ endYear + '</td></div>';

	}

	//this function is used to create the timeline
	function createTimeline(clients, options, id) {
		var timelineData = new vis.DataSet(); //dataset for the timeline

		// Gather contract data from database
		var timelineContractItems = 0;
		for (var clientIndex = 0; clientIndex < clients.length; clientIndex++) {
			var clientStartDate = new Date (clients[clientIndex].clientStart);
			var clientEndDate = new Date (clients[clientIndex].clientEnd);

			if(clients[clientIndex].role !== 'Other') {
				timelineData.add([
					{id: clientIndex, content: contentHtml(clientIndex, clientStartDate, clientEndDate), start: clientStartDate, end: clientEndDate, title: createCustomHTMLContent(clientIndex, clientStartDate, clientEndDate)}
				]);
				// Configure height based on number of stacked bars (a rough estimate, assuming contracts are ordered by start date)
				if ((clients.length <= clientIndex+1) || !(clients[clientIndex].clientEnd <= clients[clientIndex+1].clientStart)) {
					timelineContractItems++;
				}
			}
		}

		var currentDate_nextYr = currentDate.getFullYear() + 4;
		var currentDate_lastYr = currentDate.getFullYear() - 2;
		var nextYr = new Date(currentDate_nextYr, currentDate.getUTCMonth(), currentDate.getUTCDay());
		var lastYr = new Date(currentDate_lastYr, currentDate.getUTCMonth(), currentDate.getUTCDay());

		// Control height of timeline based on number of contracts
		if (timelineContractItems < 2) {
			var timelineHeight = timelineContractItems*150;
		} else if (timelineContractItems < 3) {
			var timelineHeight = timelineContractItems*100;
		}
		else if (timelineContractItems < 5) {
			var timelineHeight = timelineContractItems*85;
		}
		else if (timelineContractItems < 7) {
			var timelineHeight = timelineContractItems*75;
		}
		else {
			var timelineHeight = timelineContractItems*60;
		}

		//Set height, min and max of timeline based on calculations above
		options.height = timelineHeight + "px";
		options.min = lastYr;
		options.max = nextYr;

		//put timeline in view
		var timeline = new vis.Timeline(document.getElementById(id), timelineData, options);
	}

	//call APIs or cached data
	load.loadData().then(function(data) {
		//Initialize all views after data has finished retrieving
		/* =====================================================================
		INITIALIZE DATA AND VARIABLES
		=======================================================================*/
		$scope.csm = query.filterCSMS(data, {csm: csm})[0]; //get all of the CSM Info for the CSM
		$scope.customers = query.filterClients([$scope.csm], {status: 'current', date: new Date(), removeDuplicates: true}); //filter out the CSM's customers

		//set clients, assigned and work Effort
		$scope.clients = $scope.csm.clients;
		$scope.assigned = $scope.csm.assigned;
		$scope.workEffort = $scope.csm.workEffort;
		$scope.capacity = $scope.csm.csmCapacity;

		//initialize current clients list, future clients list and former clients list
		$scope.currentClients = query.filterClients([$scope.csm], {status: 'current', date: currentDate, removeOthers: true});
		$scope.futureClients = query.filterClients([$scope.csm], {status: 'future', date: currentDate});
		$scope.formerClients = query.filterClients([$scope.csm], {status: 'past', date: currentDate});

		$scope.currentClientsNoRepeats = query.filterClients([$scope.csm], {status: 'current', date: currentDate, removeOthers: true, removeDuplicates: true});

		/* =====================================================================
		MILESTONES
		=======================================================================*/
		//Milestones is a collection of 4 array of objects: redMilestones, yellowMilestones, greenMilestones, blueMilestones
		// Each milestone contain 4 fields
		// 1. CLIENT NAME
		// 2. Description
		// 3. Target Date
		// 4. Status: red, yellow, green. blue
		var sixmonth = new Date();
		var year = new Date();
		sixmonth.setDate(-200);
		year.setDate(-365);
		$scope.totalMilestones = [];
		$scope.redMilestones=[];
		$scope.yellowMilestones= [];
		$scope.greenMilestones= [];
		$scope.blueMilestones = [];
		for(var i =0; i<$scope.customers.length; i++){
			if($scope.customers[i].milestone === undefined){
				continue;
			} else {
				for(var j =0; j<$scope.customers[i].milestone.length; j++){
					$scope.customers[i].milestone[j].clientName = $scope.customers[i].clientName;
					$scope.totalMilestones.push($scope.customers[i].milestone[j]);
					var milestonedate = new Date($scope.customers[i].milestone[j].milestoneTargetDate);
					if($scope.customers[i].milestone[j].milestoneStatus === "red"){
						$scope.redMilestones.push($scope.customers[i].milestone[j]);
					}
					else if($scope.customers[i].milestone[j].milestoneStatus === "yellow"){
						$scope.yellowMilestones.push($scope.customers[i].milestone[j]);
					}
					else if($scope.customers[i].milestone[j].milestoneStatus === "green"){
						$scope.greenMilestones.push($scope.customers[i].milestone[j]);
					}
					else if($scope.customers[i].milestone[j].milestoneStatus === "blue" && milestonedate.getTime() < sixmonth.getTime()){
						$scope.blueMilestones.push($scope.customers[i].milestone[j]);
					}
				}
			}
		}

		/* =====================================================================
		ISSUES
		=======================================================================*/
		// currentIssues is an array of objects that contain 7 fields
		//	1. Issue title
		// 2. Status: Red, Yellow, Green, blue
		// 3. Resolution for Completed ISSUES
		// 4. Owner
		// 5. Issue Taraget Date
		// 6. Include in Dashboard
		// 7. CLIENT NAME
		$scope.issues = [];
		$scope.openIssues= [];
		$scope.accomplishmentIssues = [];
		$scope.closedIssues = [];
		for(var i =0; i<$scope.customers.length; i++){
			if($scope.customers[i].issue === undefined){
				continue;
			} else {
				for(var j=0; j<$scope.customers[i].issue.length; j++){

					$scope.customers[i].issue[j].clientName = $scope.customers[i].clientName;
					$scope.issues.push($scope.customers[i].issue[j]);
					var issuedate = new Date($scope.customers[i].issue[j].issueTargetDate);
					// open issues
					if($scope.customers[i].issue[j].issueResolution === ""){
						$scope.openIssues.push($scope.customers[i].issue[j]);
					}
					//closed issues
					if($scope.customers[i].issue[j].issueResolution !== "" && issuedate.getTime() > year.getTime()){
						// accomplishments
						if($scope.customers[i].issue[j].issueResolution === "accomplishment"){
							$scope.accomplishmentIssues.push($scope.customers[i].issue[j]);
							$scope.closedIssues.push($scope.customers[i].issue[j]);
						}
						else{
							$scope.closedIssues.push($scope.customers[i].issue[j]);
						}
					}
				}
			}
		}

		/* =====================================================================
		EXECUTIVE REPORTING
		=======================================================================*/
		//reporting is an array of objects that contain 4 strings
		// 1. Client Name
		// 2. Next Steps
		// 3. project summary
		// 4. goals
		$scope.reporting = [];
		for(var i =0; i<$scope.customers.length; i++){
			if($scope.customers[i].report=== undefined){
				continue;
			} else {
				$scope.customers[i].report.clientName = $scope.customers[i].clientName;
				$scope.reporting.push($scope.customers[i].report);
			}
		}


		/* =====================================================================
		FETCH IMAGE FOR BLUEPAGES FOR CSM PIC
		=======================================================================*/
		var requestUrl = `https://faces.tap.ibm.com/api/find/?q=${$scope.csm.csmName}&images=true`;
		$http.get(requestUrl)
		.then(function(object) {
			var imageUrl = object.data[0]["image-url"];
			$scope.csm.image = imageUrl; //set the csm's image property with the url of the csm image
		});


		/* =====================================================================
		CLIENT BREAKDOWN RADAR GRAPH
		check out the documentation from Chart.js for radar graph. This controller uses a library called tc-angular-chartjs. This library connects Chart.js to Angular.js.
		$scope.radarGraph is passed into the chart-options in the canvas tag in CSMInfoPage.html.
		Therefore, whenever $scope.radarGraph changes, the view gets updated
		=======================================================================*/
		//initialize data set
		$scope.radarGraphData = initializeRadarGraphData();

		//set up radar graph using Chart.js APIs
		$scope.radarGraph = {
			labels : createRadarLabels(),
			datasets : [
				{
					label: "Assigned",
					backgroundColor : 'rgba(92,142,193,0.4)',
					borderColor : 'rgba(92,142,193,1)',
					pointBackgroundColor : 'rgba(92,142,193,1)',
					pointBorderColor : '#fff',
					data : $scope.radarGraphData['capacity']
				},
				{
					label: "Work Effort",
					backgroundColor : "rgba(251,45,8,0.3)",
					borderColor : "rgba(251,45,8,1)",
					// pointBackgroundColor : 'rgba(92,142,193,1)',
					pointBackgroundColor: "rgba(251,45,8,1)",
					pointBorderColor : '#fff',
					data : $scope.radarGraphData['workEffort']
				}
			]
		};

		//set up options for radar graph
		$scope.radarOptions = {
			legend : {
				display: false,
				position: "top"
			},
			scale: {
				gridLines:{
					color: "#1A5C7D"
				},
				ticks: {
					fontColor: "white",
					max: Math.max(findMaxForGraph($scope.radarGraphData['capacity'], 5), findMaxForGraph($scope.radarGraphData['workEffort'], 5)),
					min: 0,
					stepSize: 5,
					backdropColor: '#323232' // should render black behind the text
				},
				angleLines:{
					display: true,
					color: "#1A5C7D"
				},
				pointLabels:{
					display: true,
					fontColor: "white"
				}
			}
		};

		//because the radar graph does not look good for two or fewer clients, this bar graph is used instead of a radar graph if there are two or fewer clients.
		$scope.engagementsBarGraph = {
			labels : createRadarLabels(),
			datasets : [
				{
					label: "Assignment",
					backgroundColor : 'rgba(92,142,193,0.4)',
					borderColor : 'rgba(92,142,193,1)',
					data : $scope.radarGraphData['capacity']
				},
				{
					label: "Work Effort",
					backgroundColor : "rgba(251,45,8,0.3)",
					borderColor : "rgba(251,45,8,1)",
					data : $scope.radarGraphData['workEffort']
				}
			]
		};

		/* =====================================================================
		CAPACITY VS. WORKEFFORT VS. ASSIGNED BAR GRAPH
		check out the documentation from Chart.js for bar graph. This controller uses a library called tc-angular-chartjs. This library connects Chart.js to Angular.js.
		$scope.barGraph is passed into the chart-options in the canvas tag in CSMInfoPage.html.
		Therefore, whenever $scope.barGraph changes, the view gets updated
		=======================================================================*/
		//intialize bar graph using Chart.js APIs
		$scope.barGraph = {
			labels : [ 'Capacity', 'Assignment', 'Work Effort'],
			datasets : [
				{
					backgroundColor : ['rgba(92,142,193,0.3)', 'rgba(92,193,120,0.3)', "rgba(251,45,8,0.3)"],
					borderColor : ['rgba(92,142,193,1)', 'rgba(92,193,120,1)', "rgba(251,45,8,1)"],
					data : [ $scope.capacity, $scope.assigned , $scope.workEffort] //data initialized above
				},
			],
			options: {
				maintainAspectRatio : false,
				responsive: true
			}
		};

		//initialize bar graph options using Chart.js APIs
		$scope.barOptions = {
			scales: {
				yAxes: [{
					ticks: {
						fontColor: "white",
						min: 0,
						stepSize: 10
					},
					scaleLabel : {
						fontColor: "white",
						display : true,
						labelString : "Percentage %"
					},
					gridLines:{
						color: "#1A5C7D"
					}
				}],
				xAxes:[{
					ticks:{
						fontColor: "white",
					},
					gridLines:{
						color: "#1A5C7D"
					}

				}]
			}
		};

		/* =====================================================================
		LINE GRAPH
		check out the documentation from Chart.js for line graph. This controller uses a library called tc-angular-chartjs. This library connects Chart.js to Angular.js.
		$scope.lineGraph is passed into the chart-options in the canvas tag in CSMInfoPage.html.
		Therefore, whenever $scope.lineGraph changes, the view gets updated
		=======================================================================*/
		//initialize data set for line graph
		$scope.selectedView = "Graph"; //this variable keeps track of whether the view is the line graph or table
		$scope.timeDivision = "Month"; //this variable keeps track of whether the view is by month or by quarter
		$scope.xAxisLabels = dates.generateXAxisLabels({start: $scope.xLabelStart, months: 12});

		$scope.capacityValues = new Array(12).fill($scope.csm.csmCapacity); //capacity values for the line graph (should be a straight line because capacity is fixed for a CSM and we cannot keep track of when the capacity of a CSM changes)
		$scope.assignedValues = calculateData(new Date(), "assigned", "Month", 12);
		$scope.xLabelStart = new Date(); //this variable determines the

		//initialize line graph using Chart.js APIs
		$scope.lineGraph = {
			labels: $scope.xAxisLabels[$scope.timeDivision],
			datasets: [
				{
					label: "Capacity",
					fill: false,
					lineTension: 0,
					// borderColor: "rgba(226,54,38,0.6)",
					borderColor: 'rgba(65, 138, 240, 0.6)',
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(65, 138, 240, 1)",
					pointBackgroundColor: "#fff",
					pointBorderWistartDateh: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(65, 138, 240, 1)",
					pointHoverBorderColor: "rgba(65, 138, 240, 1)",
					pointHoverBorderWistartDateh: 2,
					pointRadius: 2,
					pointHitRadius: 0,
					data: new Array(12).fill($scope.csm.csmCapacity),
					spanGaps: false,
				},
				{
					label: "Assignment",
					fill: false,
					lineTension: 0,
					// borderColor: '#418AF0',
					// rgba(251,45,8,0.3)" : 'rgba(92,193,120,0.3)'
					borderColor: 'rgba(92,193,120,1)',
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: 'rgba(92,193,120,1)',
					pointBackgroundColor: "#fff",
					pointBorderWistartDateh: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: 'rgba(92,193,120,1)',
					pointHoverBorderColor: 'rgba(92,193,120,1)',
					pointHoverBorderWistartDateh: 2,
					pointRadius: 2.5,
					pointHitRadius: 10,
					//data: $scope.finalData[0][0][1],
					data: $scope.assignedValues,
					spanGaps: false,
				},
				{
					label: "Work Effort",
					fill: false,
					lineTension: 0,
					borderColor : "rgba(251,45,8,0.6)",
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(226,54,38,1)",
					pointBackgroundColor: "#fff",
					pointBorderWistartDateh: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(251,45,8,1)",
					pointHoverBorderColor: "rgba(251,45,8,1)",
					pointHoverBorderWistartDateh: 2,
					pointRadius: 2,
					pointHitRadius: 0,
					data: new Array(12).fill($scope.csm.workEffort),
					spanGaps: false,
				},

			]
		};


		$scope.lineGraphMaxArray = [findMaxForGraph($scope.assignedValues, 20), findMaxForGraph($scope.capacityValues, 20), $scope.csm.workEffort];

		//initialize line graph options using Chart.js APIs
		$scope.lineOptions = {
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
						max: Math.max(... $scope.lineGraphMaxArray),
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
			}
		};

		/* =====================================================================
		TIMELINE
		Timeline uses a plugin called visjs. Check out the documentation for visjs
		=======================================================================*/
		var timelineOptions = {
			rollingMode: true,
			showCurrentTime: true,
			verticalScroll: false,
			// horizontalScroll: true,
			// zoomable: false,
			zoomMin: 1000 * 60 * 60 * 24 * 30 * 12 * 2,
			zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 2,
			margin: {
				item : {
					horizontal : -1
				}
			},
		};

		createTimeline($scope.clients, timelineOptions, 'timeline');

		//done initializing view, turn off loader
		$scope.isLoading = false;

		//refetch data from ETA once view has loaded to update data for next time if data has changed
		load.fetchFromETA().then(function(data) {
			//WILL WORK ON THIS LATER, DON'T DELETE YET

			// var currentCSMData = query.filterCSMS($scope.csmList, {csm: $scope.csm.csmName});
			// var newCSMData = query.filterCSMS(data, {csm: $scope.csm.csmName});
			// newCSMData[0].image = currentCSMData[0].image;
			// newCSMData[0].workEffort = null;
			// if(!_.isEqual(newCSMData[0], currentCSMData[0])) {
			// 	$('#panel').slideDown('slow');
			// }
			// $scope.$apply();
		});
	});

	$scope.abs = function(num) {
		return Math.abs(num);
	}

	$scope.loadETA = function(id) {
		//this function gets the correct page on ETA based on the client that is selected from the dropdown in the Add Engagements/Transfer Engagement Modal
		document.getElementById('add').src = ''; //reset the source of the iFrame
		$scope.loadingETA = true; //indicate to user that the iFrame is loading
		$http.get('https://eta2-api.w3ibm.mybluemix.net/teams/589b900e08916c00353748da/lists/accounts')
		.then(function(object) {
			var data = object.data.payload;
			var index = library.contains(id, data, "clientId");
			var route = data[index]._id;
			var url = "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + route;
			$("iframe").attr({'src' : url});
			$timeout(function() {
				$scope.loadingETA = false;
			}, 2000); //give about two second for ETA to load on the modal
		})
	}

	$scope.openForm = function(form) {
		//opens the add engagements and transfer engagements form
		document.getElementById(form).src = ''; //reset the source of the iFrame
		$('.ui.fullscreen.modal.' + form).modal('setting', 'autofocus', false); //prevent autofocus on the form (check out semantic-ui documentation)
		$('.ui.fullscreen.modal.' + form).modal('show'); //show form
	}

	$scope.closeForm = function() {
		//closes the add engagements and transfer engagement form
		$('.ui.fullscreen.modal').modal('hide');
	}

	$scope.chooseTab = function(choice) {
		//changes the view when the user clicks on the tab
		if(choice === "info"){
			$scope.clickedOn= "info";
		}
		if(choice === "issue"){
			$scope.clickedOn = "issue";
		}
		if(choice === "milestone"){
			$scope.clickedOn = "milestone";
		}
		if(choice === "executive"){
			$scope.clickedOn = "executive";
		}
	}

	$scope.chooseIssue = function(issue) {
		//changes the issue when the user selects the issue type
		if(issue === 'open'){
			$scope.issueChoice = "open";
		}
		if(issue === 'closed'){
			$scope.issueChoice = "closed";
		}
		if(issue === 'accomplishment'){
			$scope.issueChoice = "accomplishment";
		}
	}

	$scope.changeTimeDivision = function(division) {
		//this function is called whenever the "month" or "quarter" button is pressed, changes the view on the graph
		$scope.timeDivision = division;
		$scope.lineGraph.labels = dates.generateXAxisLabels({start: $scope.xLabelStart, months: 12})[division];
		$scope.lineOptions.scales.xAxes[0].scaleLabel.labelString = division;
		$scope.lineGraph.datasets[1].data = calculateData($scope.xLabelStart, 'assigned', division, 12);
	}

	$scope.moveGraph = function(direction) {
		//this function is called whenever someone presses the 'forward' or 'backward' button on the graph

		//turn off animations on the graph
		$scope.lineOptions.animation = false;

		//when the graph is moved, the $scope.xLabelStart variable must change, depending on whether the view is months or quarters
		if($scope.timeDivision === 'Month') {
			if(direction === 'forward')  $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() + 1);
			else if(direction === 'backward') $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() - 1);
		} else if($scope.timeDivision === 'Quarter') {
			if(direction === 'forward') $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() + 3);
			else if(direction === 'backward') $scope.xLabelStart.setMonth($scope.xLabelStart.getMonth() - 3);
		}

		$scope.xAxisLabels = dates.generateXAxisLabels({start: $scope.xLabelStart, months: 12}); //create new x Axis labels now that the start point has changed
		$scope.lineGraph.labels = $scope.xAxisLabels[$scope.timeDivision]; //set the labels on the view
		$scope.assignedValues = calculateData($scope.xLabelStart, 'assigned', $scope.timeDivision, 12); //calculate the new values now that the start point has changed
		$scope.lineGraph.datasets[1].data = $scope.assignedValues; //set the new values on the view
		$scope.lineOptions.scales.yAxes[0].ticks.max = Math.max(... $scope.lineGraphMaxArray); 
	}

	// When the user scrolls down 20px from the top of the document, show the button
	window.onscroll = function() {scrollFunction()};

	function scrollFunction() {
		if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			document.getElementById("myBtn").style.display = 'inherit';
		} else {
			document.getElementById("myBtn").style.display = "none";
		}
	}

	// When the user clicks on the button, scroll to the top of the document
	$scope.topFunction = function() {
		document.body.scrollTop = 0; // For Chrome, Safari and Opera
		document.documentElement.scrollTop = 0; // For IE and Firefox
	}

});
