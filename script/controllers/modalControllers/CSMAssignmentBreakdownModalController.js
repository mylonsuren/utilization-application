
CSMApp.controller("CSMAssignmentBreakdownModalController", function($scope, $http, $timeout, load) {

	// Library of functions
	var library = new UsefulFunctions();
	var query = new Query();
	var dates = new Dates();

	// Show loader
	$scope.creatingEvent = true;

	// get data
	load.loadData().then(function(data) {

		// disable loader
		$scope.creatingEvent = false;

		// gather csm data
		$scope.csms = data;

		// Gather all csms, and push to new array
		$scope.topCSMS = [];
		for (var i = 0; i < $scope.csms.length; i++) {
			$scope.topCSMS.push({
				name: $scope.csms[i].csmName,
				region: $scope.csms[i].region,
				util: query.calculateUtilization([$scope.csms[i]], new Date()),
			});
		}


		// close modal functoin
		$scope.closeModal = function() {
			$('.ui.long.modal')
			.modal('hide')
			;
		}

		// relocate user to selected csm info page
		$scope.relocate = function(item) {
			if ("name" in item) {
				window.open(
					'/CSM/' + item.name.replace(/ /g, "-"),
					'_blank'
				);
			}
		}

		// get current month and year in formatted string
		$scope.getMonthandYear = function() {
			var date = new Date();
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
			return `${months[date.getMonth()]} ${date.getFullYear()}`
		}

		// convert data object to formatted string
		$scope.getMonthYearDateFromDate = function(date) {
			// var date = new Date();
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
			return `${months[date.getMonth()]} ${date.getUTCDate()}, ${date.getFullYear()}`
		}



		// function to round numbers
		$scope.round = function (value, decimals) {
			return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		}
	});

});
