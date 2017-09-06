var CSMApp = angular.module("CSMApp", ["tc.chartjs"]);

/*====================================
COMPONENTS
======================================*/

CSMApp.component('applicationNavbar', {
	templateUrl: '/navbar.html',
	controller: 'dropDownController'
});

//modals
CSMApp.component('apReport', {
	templateUrl: '/modals/APModal.html',
	controller: 'APModalController'
});

CSMApp.component('availableCSMsReport', {
	templateUrl: '/modals/AvailableCSMsModal.html',
	controller: 'AvailableCSMsModalController'
});

CSMApp.component('clientsWithoutPremiumSupportTagReport', {
	templateUrl: '/modals/ClientsWithoutPremiumSupportTagModal.html',
	controller: 'ClientsWithoutPremiumSupportTagModalController'
});

CSMApp.component('clientUsageReport', {
	templateUrl: '/modals/ClientUsageModal.html',
	controller: 'ClientUsageModalController'
});

CSMApp.component('csmAssignmentBreakdownReport', {
	templateUrl: '/modals/CSMAssignmentBreakdownModal.html',
	controller: 'CSMAssignmentBreakdownModalController'
});

CSMApp.component('csmsNotLoggedInToETAReport', {
	templateUrl: '/modals/CSMsNotLoggedInToETAModal.html',
	controller: 'CSMsNotLoggedInToETAModalController'
});

CSMApp.component('emeaReport', {
	templateUrl: '/modals/EMEAModal.html',
	controller: 'EMEAModalController'
});

CSMApp.component('globalReport', {
	templateUrl: '/modals/GlobalModal.html',
	controller: 'GlobalModalController'
});

CSMApp.component('laReport', {
	templateUrl: '/modals/LAModal.html',
	controller: 'LAModalController'
});

CSMApp.component('missingInfoOnETAReport', {
	templateUrl: '/modals/MissingInfoOnETAModal.html',
	controller: 'MissingInfoOnETAModalController'
});

CSMApp.component('naReport', {
	templateUrl: '/modals/NAModal.html',
	controller: 'NAModalController'
});

CSMApp.component('overusingClientsReport', {
	templateUrl: '/modals/OverusingClientsModal.html',
	controller: 'OverusingClientsModalController'
});

CSMApp.component('overutilizedCSMsReport', {
	templateUrl: '/modals/OverutilizedCSMsModal.html',
	controller: 'OverutilizedCSMsModalController'
});

CSMApp.component('overutilizedGeographiesReport', {
	templateUrl: '/modals/OverutilizedGeographiesModal.html',
	controller: 'OverutilizedGeographiesModalController'
});

CSMApp.component('trialClientsReport', {
	templateUrl: '/modals/TrialClientsModal.html',
	controller: 'TrialClientsModalController'
});

CSMApp.component('unassignedClientsReport', {
	templateUrl: '/modals/UnassignedClientsModal.html',
	controller: 'UnassignedClientsModalController'
});

CSMApp.component('upcomingAndEndingContractsReport', {
	templateUrl: '/modals/UpcomingAndEndingContractsModal.html',
	controller: 'UpcomingAndEndingContractsModalController'
});

/* =================================
FILTERS
====================================*/
CSMApp.filter('overutilized', function() {
    return function(array) {
		if(!array) {
			return [];
		} else {
	        var result = [];
	        for (var i = 0; i < array.length; i++) {
	            if(parseInt(array[i].workEffort) > parseInt(array[i].cap)) {
					result.push(array[i]);
				}
	        }
	        return result;
		}
    };
});

CSMApp.filter('region', function() {
    return function(array, region) {
		if(!array) {
			return [];
		} else {
	        var result = [];
	        for (var i = 0; i < array.length; i++) {
	            if(array[i].region === region) {
					result.push(array[i]);
				}
	        }
	        return result;
		}
    };
});

//Filter a CSM's client to show only active clients
CSMApp.filter('activeClients', function() {
	return function(array) {
		if(!array) {
			return [];
		} else {
			var result = [];
			for (var i = 0; i < array.length; i++) {
				if(new Date(array[i].clientStart) <= new Date() && new Date(array[i].clientEnd) >= new Date()) {
					result.push(array[i]);
				}
			}
			return result;
		}
	};
});
