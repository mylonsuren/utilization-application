CSMApp.controller('reportsController', function($scope, $http, $timeout) {
	/*==========================================================================
	REPORTS
	To create a report that will show on the modal:
	1. Add an object to the $scope.reports array and fill in the report name,
	description, reportClassName and set isFavourite to false
	2. Create a new HTML file for the modal in the /views/modals folder
	3. Write the HTML for the modal. The parent div element under which all
	elements in the modal are placed must have the class name
	'ui long modal' + reportClassName, the same reportClassName you filled
	in for the $scope.reports array
	For example, <div class="ui long modal myReportModal">...rest of HTML code for modal ... </div>
	4. Create a controller in the /script/modalControllers folder. You
	must give the controller a name
	5. In /script/angularConfig.js, create a component. Give the component a
	name, which must be in camel case (i.e. thisIsCamelCase), and specify
	the path for the templateUrl for the HTML file you created in step 2
	and specify the name of the controller you created in step 4
	6. In views/reports.html, include a script tag include the .js file you
	created for the controller in step 4
	7. In the body of views/Reports.html, create an HTML tag with the name
	of the component you created in step 5, but in kebab case
	(i.e. this-is-kebab-case). For example, if you named the component
	'myReportModal', place the tag <my-report-modal></my-report-modal>
	inside the body of views/Reports.html

	Troubleshooting:
	1. If the modal is not positioned in the centre of the screen, then add:
	$('.ui.long.modal.' + reportClassName).modal('refresh');
	This refreshes the modal's position in case elements were rendered
	on the modal after the modal was rendered on the screen
	2. If nothing shows up on the modal when the 'Preview Report' button is
	pressed, wrap all of the code inside a $scope event listener, listening
	for the event 'modal coming in':
	$scope.$on('modal coming in', function(e) { ... all of modal controller code ...})
	This makes sure that the script executes only when the modal is rendered
	on the screen.
	===========================================================================*/
	$scope.reports = [
		{
			name: "Global Report",
			description: "View a summary of key information regarding CSM and Client utilization across the entire world",
			reportClassName: "GlobalReport"
		},
		{
			name: "North Americas Report",
			description: "View a summary of key information regarding CSM and Client utilization in the North Americas region",
			reportClassName: "NAReport"
		},
		{
			name: "EMEA Report",
			description: "View a summary of key information regarding CSM and Client utilization in the EMEA region",
			reportClassName: "EMEAReport",
			isDisabled: false,
		},
		{
			name: "Asia-Pacific Report",
			description: "View a summary of key information regarding CSM and Client utilization in the Asia-Pacific region",
			reportClassName: "APReport",
			isDisabled: false
		},
		{
			name: "Latin Americas Report",
			description: "View a summary of key information regarding CSM and Client utilization in the Latin Americas region",
			reportClassName: "LAReport",
			isDisabled: false
		},
		{
			name: "Overutilized Geographies Report",
			description: "View a list of all currently overutilized Geographies around the world",
			reportClassName: "OverutilizedGeographiesReport",
			isDisabled: false
		},
		{
			name: "Overutilized CSMs Report",
			description: "View a list of all currently overutilized CSMs around the world",
			reportClassName: "OverutilizedCSMsReport",
			isDisabled: false
		},
		{
			name: "Available CSMs Report",
			description: "View a list of all CSMs that still have the capacity to take on another client",
			reportClassName: "AvailableCSMsReport",
			isDisabled: false
		},
		{
			name: "CSM Assignment Breakdown",
			description: "View a bar graph of all CSM's current assignments broken down by their clients",
			reportClassName: "CSMAssignmentBreakdownReport"
		},
		// {
		// 	name: "Unassigned Clients Report",
		// 	description: "View a summary of all clients with pending CSM assignments",
		// 	reportClassName: "UnassignedClientsReport",
		// 	isDisabled: false
		// },
		// {
		// 	name: "Clients w/o Premium Support Tag Report",
		// 	description: "View a summary of clients with CSM engagements, but no premium support tag",
		// 	reportClassName: "ClientsWithoutPremiumSupportTagReport",
		// 	isDisabled: false
		// },
		{
			name: "Trial Clients Report",
			description: "View a list of all clients currently on a trial account",
			reportClassName: "TrialClientsReport"
		},
		{
			name: "Overusing Clients Report",
			description: "View a list of all clients currently using more support than purchased ",
			reportClassName: "OverusingClientsReport",
			isDisabled: false
		},
		{
			name: "Client Usage Report",
			description: "View an overview of current clients, and their usage broken down by CSM.",
			reportClassName: "ClientUsageReport"
		},
		{
			name: "Upcoming and Ending Contracts Report",
			description: "View an overview of upcoming and ending contracts.",
			reportClassName: "UpcomingAndEndingContractsReport"
		},
		// {
		// 	name: "Missing Info On ETA Report",
		// 	description: "View a summary of missing, incomplete, or invalid ETA information",
		// 	reportClassName: "MissingInfoOnETAReport",
		// 	isDisabled: false
		// },
		// {
		// 	name: "CSMs Not Logged In to ETA",
		// 	description: "View a list of CSMs listed on an adoption record but have not yet signed in to ETA",
		// 	reportClassName: "CSMsNotLoggedInToETAReport",
		// 	isDisabled: false
		// }
	];

	// display modal
	$scope.displayReport = function(report) {
		var className = '.ui.long.modal.' + report;
		$scope.$broadcast('modal coming in');
		$(className).modal('setting', 'autofocus', false);
		$(className).modal('show');
	}

	// open pdf in new window
	$scope.viewPDF = function(report) {
		window.open(
			'/Reports/' + report,
			'_blank' // <- This is what makes it open in a new window.
		);
	}
});
