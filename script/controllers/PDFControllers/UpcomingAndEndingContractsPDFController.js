CSMApp.controller("UpcomingAndEndingContractsPDFController", function($scope, $http, $timeout, load) {


  // Initialize Loader
  $scope.creatingEvent = true;

  // Library
  var library = new UsefulFunctions();
  var query = new Query();
  var dates = new Dates();

  // Print Function
  $scope.print = function() {
    window.print();
  }

  // Get Data
  load.loadData().then(function(data) {

    // Gather CSM Data
    var csmList = data;
    $scope.csms = query.filterCSMS(csmList, {});


    // Gets index of value in arr, for Contracts using their ID
    function getIndexArrayContracts (arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === value) {
          return i;
        }
      }
      return -1;
    }

    // Gets index of value in arr
    function getIndexArray(arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
          return i;
        }
      }
      return -1;
    }

    // Initialize Arrays
    $scope.contractTypes = [];
    $scope.searchContracts = '';

    // Determine current clients
    $scope.clients = query.filterClients($scope.csms, {date: new Date(), status: 'current', removeOthers: true, removeDuplicates: true});

    // Determine Current Contracts
    $scope.contracts = query.filterClients($scope.csms, {date: new Date, status: 'current', removeOthers: true});

    // Ensure that totalPurchased exists
    for (var x in $scope.clients) {
      if ($scope.clients[x].totalPurchased == null) {
        $scope.clients[x].totalPurchased = 0;
      }
    }

    // Initialize Arrays
    $scope.startingMonth = [];
    $scope.endingMonth = [];
    $scope.endingMonthAffectedCSMS = [];
    $scope.startingMonthAffectedCSMS = [];
    $scope.searchGeos = [];
    $scope.searchRoles = [];

    // Get the Next 6 Months
    $scope.months = [];
    var currentDate = new Date();
    for (var i = 0; i < 6; i++) {
      $scope.months.push($scope.getMonth(currentDate));
      currentDate.setMonth(currentDate.getUTCMonth() + 1);
    }

    // Determine contracts that start and end within the next 6 months
    for (var i = 0; i < $scope.csms.length; i++) {
      for (var x = 0; x < $scope.csms[i].clients.length; x++) {

        var contractIndex = getIndexArrayContracts($scope.contracts, $scope.csms[i].clients[x].id);
        var typeIndex = getIndexArray($scope.contractTypes, $scope.csms[i].clients[x].isTrial);

        var geoIndex = getIndexArray($scope.searchGeos, $scope.csms[i].clients[x].clientRegion);

        var roleIndex= getIndexArray($scope.searchRoles, $scope.csms[i].clients[x].role);


        if (typeIndex == -1) {
          $scope.contractTypes.push($scope.csms[i].clients[x].isTrial);
        }

        if (geoIndex == -1) {
          $scope.searchGeos.push($scope.csms[i].clients[x].clientRegion);
        }

        if (roleIndex == -1) {
          $scope.searchRoles.push($scope.csms[i].clients[x].role);
        }

        var currentDate = new Date();
        var currentMonth = currentDate.getUTCMonth();
        var currentYear = currentDate.getFullYear();
        var currentDay = currentDate.getUTCDate();

        var sixMonths = new Date(currentDate.getUTCMonth() + 6);;

        var clientStart = new Date($scope.csms[i].clients[x].clientStart);
        var clientStartMonth = clientStart.getUTCMonth();
        var clientStartYear = clientStart.getFullYear();
        var clientStartDay = clientStart.getUTCDate();
        clientStart = new Date(clientStartYear, clientStartMonth, clientStartDay);

        if ((clientStart >= currentDate) && (clientStartMonth >= currentMonth && clientStartMonth <= sixMonths) && (clientStartYear == currentYear) && $scope.csms[i].clients[x].role != 'Other') {
          $scope.startingMonth.push({
            name: $scope.csms[i].clients[x].clientName,
            id: $scope.csms[i].clients[x].accountID,
            role: $scope.csms[i].clients[x].role,
            type: $scope.csms[i].clients[x].isTrial,
            cap: $scope.csms[i].clients[x].clientCapacity,
            csm: $scope.csms[i].csmName,
            csmCountry: $scope.csms[i].market,
            country: $scope.csms[i].clients[x].clientMarket,
            region: $scope.csms[i].clients[x].clientRegion,
            startDate: new Date($scope.csms[i].clients[x].clientStart),
            start: $scope.getMonthYearDateFromDate(new Date($scope.csms[i].clients[x].clientStart))
          });

          var csmIndex = getIndexArray($scope.startingMonthAffectedCSMS, $scope.csms[i].csmName);
          if (csmIndex === -1) {
            $scope.startingMonthAffectedCSMS.push($scope.csms[i].csmName);
          }
        }

        var clientEnd = new Date($scope.csms[i].clients[x].clientEnd);
        var clientEndMonth = clientEnd.getUTCMonth();
        var clientEndYear = clientEnd.getFullYear();
        var clientEndDay = clientEnd.getUTCDate();
        clientEnd = new Date(clientEndYear, clientEndMonth, clientEndDay);

        if ((clientEnd >= currentDate) && (clientEndMonth >= currentMonth && clientEndMonth <= sixMonths) && (clientEndYear == currentYear) && $scope.csms[i].clients[x].role != 'Other') {
          $scope.endingMonth.push({
            name: $scope.csms[i].clients[x].clientName,
            id: $scope.csms[i].clients[x].accountID,
            role: $scope.csms[i].clients[x].role,
            type: $scope.csms[i].clients[x].isTrial,
            cap: $scope.csms[i].clients[x].clientCapacity,
            csm: $scope.csms[i].csmName,
            csmCountry: $scope.csms[i].market,
            country: $scope.csms[i].clients[x].clientMarket,
            region: $scope.csms[i].clients[x].clientRegion,
            endDate: new Date($scope.csms[i].clients[x].clientEnd),
            end: $scope.getMonthYearDateFromDate(new Date($scope.csms[i].clients[x].clientEnd))
          });

          var csmIndex = getIndexArray($scope.endingMonthAffectedCSMS, $scope.csms[i].csmName);
          if (csmIndex === -1) {
            $scope.endingMonthAffectedCSMS.push($scope.csms[i].csmName);
          }
        }
      }
    }

    // Initialize Search Dropdown Menus
    $('#monthStartDropdown').dropdown();
    $('#monthDropdown').dropdown();
    $('#typeDropdown').dropdown();
    $('#typeStartDropdown').dropdown();


    // Get new Data from ETA
    load.fetchFromETA();

    // Disable Loader
    $scope.creatingEvent = false;
    $scope.$apply();
  })


  // Get Width of Screen
  $scope.screenWidth = window.screen.availWidth;


  // Get Current Date in String Format
  $scope.getDate = function() {
    var date = new Date();
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  }

  // Round Numbers
  $scope.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  // Get current Month and Year in String format
  $scope.getMonthandYear = function() {
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Get Month of date object in String format
  $scope.getMonth = function(date) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]}`
  }

  // Convert Date object into a String
  $scope.getMonthYearDateFromDate = function(date) {
    var newDate = new Date(date);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getFullYear()}`
  }

  // Determine if contract is already finished
  $scope.alreadyFinished = function(endDate) {
    var endingDate = new Date(endDate);

    if (endingDate < new Date()) {
      return true;
    }
    return false;
  }

  // Determine if a contract has already started
  $scope.alreadyStarted = function(startDate) {
    var startingDate = new Date(startDate);

    if (startingDate < new Date()) {

      return true;
    }
    return false;
  }

  // Table Sorting Orders
  $scope.endingTableSortingOrder = 'endDate';
  $scope.startingTableSortingOrder = 'startDate';

  // Flip table sorting order
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      return value.substring(1, value.length);
    }
    return "-" + value;
  };

  // Redirect each contract to its ETA Account Page
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }


});
