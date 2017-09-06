CSMApp.controller('CSMListPageController', function($scope, $http, load){

	//this is a plugin which controllers the sorting of the tables
	$('#csmTable').tablesort();
	$('thead th.float').data('sortBy', function(th, td, tablesort) {
		return parseFloat(td.text());
	});

	//initialize tooltips
	$(document).ready(function() {
    	$('[data-toggle="tooltip"]').tooltip();
	});

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

	//import libraries from the /script/libraries folder
	var query = new Query();
	var library = new UsefulFunctions();
	var date = new Date();

	$scope.query = query;

	function removeDuplicates(array) {
		var hashSet = {};
		for(var i = array.length - 1; i >= 0; i--) {
			if(array[i] in hashSet) {
				array.splice(i, 1);
			} else {
				hashSet[array[i]] = true;
			}
		}
	}

	function fetchCSMImagesFromAPI(csm) {
		var requestUrl = `https://faces.tap.ibm.com/api/find/?q=${csm.csmName}&images=true`; //this is the API endpoint. Inject csm's name into the search query to find csm's image on bluepages
		$http.get(requestUrl) //perform get request
			.then(function(object) {
				var imageUrl = object.data[0]["image-url"]; //obtain url for the image from data received in get request
				csm.image = imageUrl; //save the image URL into the csm object
				images[csm.csmName] = imageUrl;
				localStorage['images'] = JSON.stringify(images); //storage image URL onto localStorage so don't need to call bluePages API again
			});
	}

	//this function is called by the CSMListPage.html view
	$scope.fetchImage = function(csm) {
		if(csm.csmName == "Sajeev Madhavan" || csm.csmName === "TBD") return "/defaultprofilepic.jpg"; //this is hardcoded idk why Sajeev's image is not working
		return csm.image ? csm.image : "/defaultprofilepic.jpg";
	}

	$scope.isLoading = true;

	load.loadData()
		.then(function(data) {
			$scope.csms = data;
			$scope.clientListFilter = {removeDuplicates: true, status: 'current', date: new Date(), removeOthers: true};

			//code to fetch images from the blue pages API
			var images = localStorage['images'] ? JSON.parse(localStorage['images']) : {};

			for(var i =0; i<$scope.csms.length; i++) {
				if(!($scope.csms[i].csmName in images)) fetchCSMImagesFromAPI($scope.csms[i]);
				else $scope.csms[i].image = images[$scope.csms[i].csmName];
			}

			//set the roles of each CSM
			for(var i=0; i<$scope.csms.length; i++){
				$scope.csms[i].role = [];
				for(var j=0; j<$scope.csms[i].clients.length; j++){
					if($scope.csms[i].clients[j].role === 'Other'){
						continue;
					} else {
						$scope.csms[i].role.push($scope.csms[i].clients[j].role);
					}
				}
				removeDuplicates($scope.csms[i].role);
			}

			$scope.csmNorthAmerica = query.filterCSMS($scope.csms, {geo: 'North America'});
			$scope.csmLatinAmerica = query.filterCSMS($scope.csms, {geo: 'Latin America'});
			$scope.csmEMEA = query.filterCSMS($scope.csms, {geo: 'EMEA'});;
			$scope.csmAsiaPacific = query.filterCSMS($scope.csms, {geo: 'Asia Pacific'});;

			$scope.sortOrder = "-percentUtilization";

			$scope.sortBy = function(sortingOrder) {
				$scope.sortOrder = sortingOrder;
			}

			//this function links to the csm's info page
			$scope.fetchUrl = function(csm) {
				var name = csm.csmName.replace(/ /g,"-");
				var url = "/CSM/" + name;
				return url;
			}

			$scope.relocate = function(url) {
				location.href = url;
			}

			$scope.round = function (value, decimals) {
				return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
			}

			$scope.isLoading = false;

			load.fetchFromETA(); //once the page has loaded, fetch data from ETA again
		});
});
