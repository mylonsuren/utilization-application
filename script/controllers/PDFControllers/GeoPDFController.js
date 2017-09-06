CSMApp.controller("GeoPDFController", function($scope, $http, load) {

  // Initialize Loader
  $scope.isLoading = true;

  // Library of Functions
  var library = new UsefulFunctions();
  var query = new Query();
  var dates = new Dates();

  $scope.library = library;

  // Map Geo Report Class Names
  var table = {
    'EMEAReport': 'EMEA',
    'NAReport' : 'North America',
    'APReport' : 'Asia Pacific',
    'LAReport' : 'Latin America',
    'GlobalReport' : 'Global'
  };

  // Determine current region
  $scope.region = table[location.href.split('/').pop()];

  // Get Data
  load.loadData().then(function(data) {
    // Gather CSM Data
    $scope.csmList = data;

    // Determine CSMs in the current region
    $scope.regionCSMs = query.filterCSMS($scope.csmList, {geo: $scope.region});

    // Determine overutilized CSMs in the current region
    $scope.overutilizedCSMs = query.filterCSMS($scope.csmList, {geo: $scope.region, isOverutilized: true});

    // Determine statistics for the Geo, including Capacity, Assigned, Work Effort, and Utilization
    $scope.geoCapacity = query.calculateCapacity($scope.regionCSMs);
    $scope.geoAssignments = query.calculateAssigned($scope.regionCSMs, new Date());
    $scope.geoUtil = $scope.round(query.calculateUtilization($scope.regionCSMs, new Date), 2);
    $scope.workEffort = query.calculateCSMWorkEffort($scope.regionCSMs);
    $scope.numberOfContracts = query.filterClients($scope.csmList, {status: 'current', date: new Date, geo: $scope.region, removeOthers: true}).length;

    // Determine the clients in the region
    $scope.regionClients = query.filterClients($scope.csmList, {status: 'current', date: new Date, geo: $scope.region, removeDuplicates: true, removeOthers: true});
    $scope.numberOfClients = $scope.regionClients.length;

    // Filter CSMs to show only active clients
    for (var i in $scope.regionCSMs) {
      var today = new Date();
      $scope.regionCSMs[i].activeClients = [];
      for (var x in $scope.regionCSMs[i].clients) {
        if (dates.checkDate(today, dates.parseMongoDate(new Date($scope.regionCSMs[i].clients[x].clientStart)), dates.parseMongoDate(new Date($scope.regionCSMs[i].clients[x].clientEnd))) === 'current') {
          if ($scope.regionCSMs[i].clients[x].role !== 'Other') {
            $scope.regionCSMs[i].activeClients.push($scope.regionCSMs[i].clients[x]);
          }
        }
      }
    }

    // Remove duplicate CSM names from displaying on the client table
    for (var i in $scope.regionClients) {
      var existingNames = [];
      $scope.regionClients[i].csmNames = [];
      for (var x in $scope.regionClients[i].csms) {
        if (library.contains($scope.regionClients[i].csms[x].name, existingNames) === -1) {
          existingNames.push($scope.regionClients[i].csms[x].name);
          $scope.regionClients[i].csmNames.push({
            name: $scope.regionClients[i].csms[x].name,
            region: $scope.regionClients[i].csms[x].region
          });
        }
      }
    }

    // Disable Loader
    $scope.isLoading = false;

    // Determine if the CSM is within the current region
    $scope.checkRegion = function(csm) {
      return $scope.region === 'Global' || $scope.region === csm.region;
    }

    // Apply changes
    $scope.$apply();

    // Get new data from ETA
    load.fetchFromETA();
  });


  // Relocate to appropriate CSM Page
  $scope.relocate = function(item) {
    if("csmName" in item) {
      window.open(
        '/CSM/' + item.csmName.replace(/ /g, "-"),
        '_blank'
      );
    }
  }

  // Determine which pages to show on report
  $scope.filters = [true, true, true];
  $scope.first = 0;

  // Hide pages based on user selection
  $scope.toggleView = function(view) {
    $scope.filters[view] = !$scope.filters[view];
  }

  // Determine which page is first, when other pages are hidden from view
  $scope.first = function() {
    for(var i = 0; i < $scope.filters.length; i++) {
      if($scope.filters[i]) {
        return i;
      }
    }
  }

  // Print function
  $scope.print = function() {
    window.print();
  }

  // Get the current date in String format (i.e. 2016/08/01)
  $scope.getDate = function() {
    var date = new Date();
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  }

  // Get current month and year in String format
  $scope.getMonthandYear = function() {
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Function that rounds number to nearest specified decimal place
  $scope.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  // Flips table sorting order
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      return value.substring(1, value.length);
    }
    return "-" + value;
  };

  // Determines whether to show subscription based statistics or CSM based statistics
  $scope.units = true; //true will represent subscriptions, false will represent csms

  // Toggle between subscription based statistics and CSM based statistics
  $scope.toggleUnits = function() {
    $scope.units = !$scope.units;
  }

  // Initialize Table Sorting Order
  $scope.csmTableSortingOrder = "csmName";
  $scope.clientTableSortingOrder = "clientName";
  
});
