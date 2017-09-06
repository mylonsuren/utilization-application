CSMApp.controller('ClientListPageController', function($scope, $http, $timeout, load){
	//Makes the loader appear
	$scope.isLoading = true;

	//import libraries
	var query = new Query();
	var library = new UsefulFunctions();
	var date = new Date();

	//this is a plugin. This controllers the sorting on the tables
	$('#clientTable').tablesort();

	$('thead th.float').data('sortBy', function(th, td, tablesort) {
		return parseFloat(td.text());
	});

	//initialize tooltips that appear beside each client card once the document has properly loaded
	$(document).ready(function() {
    	$('[data-toggle="tooltip"]').tooltip();

		$timeout(function() {
			$('.blurring.card').dimmer({
				dimmer : $('ui.inverted.dimmer'),
				on: 'hover',
				inverted: true
			});

			$('.blurring.card')
			  .popup({
				popup : $('.ui.inverted.custom.popup'),
				on    : 'click',
				lastResort: 'bottom center',
				closable: true,
				variation: 'wide'
			});
		}, 10);
	});

	//scrolling animations for the regions buttons
	$("#AsiaPacificButton").click(function() {
    	$('html, body').animate({ scrollTop:$("#Asia-Pacific").offset().top}, 500);
	});

    //mapping from ETA db markets names to actual full names
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

	//scrolling animations for the regions buttons
	$("#AsiaPacificButton").click(function() {
    	$('html, body').animate({ scrollTop:$("#Asia-Pacific").offset().top}, 500);
	});
	$("#EMEAButton").click(function() {
		$('html, body').animate({ scrollTop:$("#EMEA").offset().top}, 500);
	});
	$("#NorthAmericaButton").click(function() {
		$('html, body').animate({ scrollTop:$("#NorthAmerica").offset().top}, 500);
	});
	$("#LatinAmericaButton").click(function() {
		$('html, body').animate({ scrollTop:$("#LatinAmerica").offset().top}, 500);
	});

    //function for redirect to ETA button
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }

	load.loadData()
		.then(function(data) {
			//initialize the required data for this page
			$scope.csms = query.filterCSMS(data, {});
            $scope.clients = query.filterClients($scope.csms, {removeDuplicates: true, status: 'current', date: new Date(), removeOthers: true});
            $scope.currentWithDuplicates = query.filterClients($scope.csms, {status: 'current', date: new Date(), removeOthers: true});
            $scope.futureWithDuplicates = query.filterClients($scope.csms, {status: 'future', date: new Date(), removeOthers: true});
            $scope.pastWithDuplicates = query.filterClients($scope.csms, { status: 'past', date: new Date(), removeOthers: true});
			$scope.clients.sort(alphaSort("clientName"));

            //number to tell popup what index it is on
            $scope.nval = 1;
            $scope.updateNVal = function (index) {
                $scope.nval = index;
            }

            //function to sort the list of clients
            function alphaSort(property) {
                var sortOrder = 1;
                if(property[0] === "-") {
                    sortOrder = -1;
                    property = property.substr(1);
                }
                return function (a,b) {
                    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                    return result * sortOrder;
                }
            }

            //returns all engagements belonging to client with a specific id in a given array
            $scope.returnAllEngagements = function(id, array) {
                var results = [];
                for(var i = 0; i < array.length; i++) {
                    if (array[i].id === id) {
                        results.push(array[i]);
                    }
                }
                return results;
            }

            //remove duplicate csms for "CSMs Currently Involved"
            $scope.removeDuplicateNames = function (csms) {
                $scope.result= [];
                for (var i = 0 ; i < csms.length; i++) {
                    if(!$scope.contains(csms[i].name, $scope.result)) {
                        $scope.result.push(csms[i]);
                    }
                }
                return $scope.result;
            }
            //helper function for $scope.removeDuplicateNames
            $scope.contains = function (name, csms) {
                    for (var j = 0; j < csms.length; j++) {
                        if (name === csms[j].name)
                            return true;
                    }
                return false;
            }

            //default sort order for the list view is by totalPurchased
			$scope.sortOrder = "-totalPurchased";
			$scope.sortBy = function(sortingOrder) {
				$scope.sortOrder = sortingOrder;
			}

			$scope.isLoading = false;

			load.fetchFromETA();
		});
});
