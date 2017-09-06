
CSMApp.controller("ClientUsagePDFController", function($scope, $http, $timeout, load) {

  // Initialize Loader
  $scope.creatingEvent = true;

  // Library of Useful Functions
  var library = new UsefulFunctions();
  var query = new Query();
  var dates = new Dates();

  // Print function
  $scope.print = function() {
    window.print();
  }

  // Get data
  load.loadData().then(function(data) {

    // Gather CSM Data
    var csmList = data;
    $scope.csms = query.filterCSMS(csmList, {});


    // Function to get index of value in an array of contracts
    function getIndexArrayContracts (arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === value) {
          return i;
        }
      }
      return -1;
    }

    // Function to get index of value in an array
    function getIndexArray(arr, value) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
          return i;
        }
      }
      return -1;
    }

    // Initialize array of Contract Types
    $scope.contractTypes = [];
    $scope.searchContracts = '';

    // Draw each Geo Graph
    drawGraph("Americas");
    drawGraph("Latin-America");
    drawGraph("EMEA");
    drawGraph("Asia-Pacific");

    // Determine all current active clients
    $scope.clients = query.filterClients($scope.csms, {date: new Date(), status: 'current', removeOthers: true, removeDuplicates: true});

    // Determine all current active contracts
    $scope.contracts = query.filterClients($scope.csms, {date: new Date, status: 'current', removeOthers: true});


    // Ensure that totalPurchased exists
    for (var x in $scope.clients) {
      if ($scope.clients[x].totalPurchased == null) {
        $scope.clients[x].totalPurchased = 0;
      }
    }

    // Initialize Arrays that contain contracts that start this month, and
    // contracts that end this month
    $scope.startingMonth = [];
    $scope.endingMonth = [];

    // Initialize Geo Search and Role Search Arrays
    $scope.searchGeos = [];
    $scope.searchRoles = [];


    // Determine which contracts start and end this month
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

        var clientStart = new Date($scope.csms[i].clients[x].clientStart);
        var clientStartMonth = clientStart.getUTCMonth();
        var clientStartYear = clientStart.getFullYear();
        var clientStartDay = clientStart.getUTCDate();
        clientStart = new Date(clientStartYear, clientStartMonth, clientStartDay);

        // Add to contracts that start this month
        if ((clientStartMonth == currentMonth) && (clientStartYear == currentYear) && $scope.csms[i].clients[x].role != 'Other') {

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
            startDate: $scope.csms[i].clients[x].clientStart,
            start: $scope.getMonthYearDateFromDate(new Date($scope.csms[i].clients[x].clientStart))
          });

        }

        var clientEnd = new Date($scope.csms[i].clients[x].clientEnd);
        var clientEndMonth = clientEnd.getUTCMonth();
        var clientEndYear = clientEnd.getFullYear();
        var clientEndDay = clientEnd.getUTCDate();
        clientEnd = new Date(clientEndYear, clientEndMonth, clientEndDay);


        // Add to contracts that end this month
        if ((clientEndMonth == currentMonth) && (clientEndYear == currentYear) && $scope.csms[i].clients[x].role != 'Other') {

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
            endDate: $scope.csms[i].clients[x].clientEnd,
            end: $scope.getMonthYearDateFromDate(new Date($scope.csms[i].clients[x].clientEnd))
          });

        }
      }
    }

    // Initialize Search Menu Dropdowns
    $('#contractsDropdown').dropdown();
    $('#csmDropdown').dropdown();
    $('#typeDropdown').dropdown();
    $('#geoDropdown').dropdown();
    $('#roleDropdown').dropdown();




    // Determine Average Client Purchase
    $scope.avgClientPurchase = 0;

    for (var i = 0; i < $scope.clients.length; i++) {
      $scope.avgClientPurchase += $scope.clients[i].totalPurchased;
    }

    $scope.avgClientPurchase = $scope.round($scope.avgClientPurchase/$scope.clients.length, 2);


    // Draw Each Graph
    function drawGraph(geo) {
      $scope.clientListNames = [];

      $scope.csmWork = new Array($scope.csms.length);
      $scope.clientCountries = [];


      $scope.totalNumContracts = 0;

      // Map Client Regions to Geos
      $scope.regions = {"Americas" : ["NA", "Americas", "North America"], "Latin-America" : ["LA", "Latin America"], "Asia-Pacific" : ["AP", "JP", "Asia Pacific"], "EMEA" : ["EU", "EMEA"]};


      // Determine what Geo each Client is in
      for (var i = 0; i < $scope.csms.length; i++) {
        for (var x = 0; x < $scope.csms[i].clients.length; x++){
          if (arrayContains($scope.regions[geo], $scope.csms[i].clients[x].clientRegion)) {
            if (((new Date($scope.csms[i].clients[x].clientStart) <= new Date()) && (new Date($scope.csms[i].clients[x].clientEnd) >= new Date()))) {
              $scope.totalNumContracts++;
              if (!arrayContains($scope.clientListNames, $scope.csms[i].clients[x].clientName)) {
                $scope.clientListNames.push($scope.csms[i].clients[x].clientName);
                $scope.clientCountries.push($scope.csms[i].clients[x].clientMarket)
              }
            }
          }
        }
      }

      // Initialize CSM Work Array
      for (var i = 0; i < $scope.csms.length; i++) {
        $scope.csmWork[i] = new Array($scope.clientListNames.length);

        for (var x = 0; x < $scope.clientListNames.length; x++) {
          $scope.csmWork[i][x] = 0;
        }
      }

      // Populate CSM work Array based on client assignment data
      for (var i = 0; i < $scope.csms.length; i++) {
        for (var x = 0; x < $scope.csms[i].clients.length; x++){
          if (arrayContains($scope.regions[geo], $scope.csms[i].clients[x].clientRegion)) {

            var clientCount = getIndexArray($scope.clientListNames, $scope.csms[i].clients[x].clientName);
            if (clientCount != -1 && ((new Date($scope.csms[i].clients[x].clientStart) <= new Date()) && (new Date($scope.csms[i].clients[x].clientEnd) >= new Date()))) {
              $scope.csmWork[i][clientCount] += $scope.csms[i].clients[x].clientCapacity;

            }
          }
        }
      }

      $scope.clientUtil = [];
      $scope.capSum = 0;
      $scope.avgPurchase = 0;
      $scope.numberOfCSMS = 0;

      // Determine number of csms within specified region
      // and a clients total assigned csm support
      for (var i = 0; i < $scope.clientListNames.length; i++) {
        for (var x = 0; x < $scope.csms.length; x++) {
          $scope.capSum += $scope.csmWork[x][i];
          if ($scope.csmWork[x][i] > 0) {
            $scope.numberOfCSMS++;
          }
        }


        $scope.clientUtil.push({
          name: $scope.clientListNames[i],
          cap: $scope.capSum,
          country: $scope.clientCountries[i],
          numCSMS: $scope.numberOfCSMS,
        });

        $scope.avgPurchase += $scope.capSum;
        $scope.capSum = 0;
        $scope.numberOfCSMS = 0;
      }

      // Determine Client Average purchase
      $scope.avgPurchase = Math.round(($scope.avgPurchase/$scope.clientListNames.length)*100)/100;

      // Function to determine if the value exists in the Array
      function arrayContains(arr, value) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] === value) {
            return true;
          }
        }
        return false;
      }

      // Determine height of the bar chart
      function calcHeight(clientsInRegion) {
        if (clientsInRegion < 27) {
          return '750px;'
        }
        else if (clientsInRegion < 40) {
          return 80*clientsInRegion;
        }
        else if (80*clientsInRegion > 1000) {
          return 1000;
        }
      }


      // Draw Bar Chart
      $scope.clientUsageChart = Highcharts.chart('clientUsageGraph' + geo, {
        chart: {
          type: 'bar',
          animation: false,
          height: calcHeight($scope.clientListNames.length),
        },
        title: {
          text: ''
        },
        xAxis: {
          categories: [],
          stackLabels: {
            enabled: true,
          },
        },
        yAxis: {
          min: 0,
          minTickInterval: 20,
          title: {
            text: ''
          },
        },
        legend: {
          reversed: false,
          enabled:false,
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          series: {
            animation: false,
            stacking: 'normal',
            pointPadding: 0,
            groupPadding: 0.1,
            dataLabels: {
              enabled: true,
              formatter: function () {
                if (this.y == 0) {
                  return null;
                }
                return this.series.name + ' (' + this.y + '%)';
              }
            },
          }
        },
        series: []
      });

      // Set x-axis categories to client Names
      $scope.clientUsageChart.xAxis[0].setCategories($scope.clientListNames);

      // Add each csm assigment to client series on bar chart
      for (var i = 0; i < $scope.csms.length; i++) {
        $scope.clientUsageChart.addSeries({
          name: $scope.csms[i].csmName,
          data: $scope.csmWork[i],
        });
      }
    }
    // End of drawGraph function

    // Get new data from ETA
    load.fetchFromETA();

    // Disable Loader
    $scope.creatingEvent = false;

    // Apply changes
    $scope.$apply();
  })


  // Initialize all pages to be visible
  $scope.filters = [true, true, true];
  $scope.first = 0;

  // Toggle a page to be visible or hidden
  $scope.toggleView = function(view) {
    $scope.filters[view] = !$scope.filters[view];
  }

  // Determine which page is first
  $scope.first = function() {
    for(var i = 0; i < $scope.filters.length; i++) {
      if($scope.filters[i]) {
        return i;
      }
    }
  }

  // Width of window on which the application is being displayed
  $scope.screenWidth = window.screen.availWidth;


  // Get current date as a formatted string
  $scope.getDate = function() {
    var date = new Date();
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  }

  // Function to round numbers
  $scope.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  // Get current month and year as a formatted string
  $scope.getMonthandYear = function() {
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Convert date object to a formatted string
  $scope.getMonthYearDateFromDate = function(date) {
    var newDate = new Date(date);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getFullYear()}`
  }

  // Determine if the contract has already finished
  $scope.alreadyFinished = function(endDate) {
    var endingDate = new Date(endDate);

    if (endingDate < new Date()) {
      return true;
    }
    return false;
  }

  // Determine if the contract has already started
  $scope.alreadyStarted = function(startDate) {
    var startingDate = new Date(startDate);

    if (startingDate < new Date()) {
      return true;
    }
    return false;
  }


  // Redirect each client to its respective account page on ETA
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }


});
