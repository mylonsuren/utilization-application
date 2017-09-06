CSMApp.controller('dropDownController', function($scope, $http, load) {

	$('.ui.dropdown').dropdown(); //initialize dropdown on the search bar

	//import libraries
	var library = new UsefulFunctions();
	var dates = new Dates();
	var query = new Query();

	localStorage['images'] = JSON.stringify({});

	function fetchCSMImagesFromAPI(csm) {
		var requestUrl = `https://faces.tap.ibm.com/api/find/?q=${csm.csmName}&images=true`; //this is the API endpoint. Inject csm's name into the search query to find csm's image on bluepages
		$http.get(requestUrl) //perform get request
			.then(function(object) {
				var imageUrl = object.data[0]["image-url"]; //obtain url for the image from data received in get request
				var images = JSON.parse(localStorage['images']);
				images[csm.csmName] = imageUrl;
				localStorage['images'] = JSON.stringify(images);
			});
	}

	load.loadData().then(function(data) {
		var csms = data;

		for(var i =0; i<csms.length; i++) {
	    	fetchCSMImagesFromAPI(csms[i]);
		}

		//check out Documentation for semantic-ui search. This function creates the HTML that will appear when someone types on the search bar
		$.fn.search.settings.templates.custom = function(response) {
			var html = `<div class="ui segment"><div class="ui divided items">`;
			for(var i = 0; i < response.results.length; i++) {
				var result = response.results[i];
				html +=
				`<div class="item">
    				<a href="/CSM/${result.csmName.replace(/ /g, "-")}" class="ui tiny image">
      					<img src="${JSON.parse(localStorage['images'])[result.csmName]}" href="/CSM/${result.csmName.replace(/ /g, "-")}">
    				</a>
    				<div class="content">
      					<a class="header" style="text-decoration: none;" href="/CSM/${result.csmName.replace(/ /g, "-")}">${result.csmName}</a>
      					<div class="description">
        					<div class="cinema">Assigned Utilization: ${library.calculatePercent(result.assigned, result.csmCapacity, 2)}%</div>
							<div class="cinema">Actual Utilization: ${result.utilization} %</div>
      					</div>
    				</div>
  				</div>`;
			}
			html += `</div></div>`;
			return html;
		};

		$('.ui.search')
			.search({
				source: csms,
				type: 'custom',
				searchFields : [
					'csmName'
				],
				fields : {
					title: 'csmName',
					description: 'utilization'
				},
			});
	});
});
