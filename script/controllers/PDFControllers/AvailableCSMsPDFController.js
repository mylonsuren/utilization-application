CSMApp.controller("AvailableCSMsPDFController", function($scope, $http, load) {

  // Initialize Loader
  $scope.isLoading = true;

  // Library
  var library = new UsefulFunctions();
  var query = new Query();
  var dates = new Dates();

  // Get Data
  load.loadData().then(function(data) {

    // Gather CSM Data
    $scope.csmList = data;

    // Determine underutilizedCSMS, overutilizedCSMS, and maxUtilizedCSMS (100% Utilized)
    $scope.underutilizedCSMS = query.filterCSMS($scope.csmList, {isUnderutilized: true});
    $scope.overutilizedCSMS = query.filterCSMS($scope.csmList, {isOverutilized: true});
    $scope.maxUtilizedCSMS = query.filterCSMS($scope.csmList, {isMaxUtilized: true});

    // Initialize Array
    $scope.noContractCSMS = [];

    // Initialize and Declare Average CSM Availability
    $scope.avgAvailable = 0;

    // Determine Active Clients, Contracts, and Average CSM Availability
    for (var i = 0; i < $scope.underutilizedCSMS.length; i++) {
      if($scope.underutilizedCSMS[i].assigned === 0) {
        console.log($scope.underutilizedCSMS[i].csmName);
        $scope.noContractCSMS.push($scope.underutilizedCSMS[i]);
      }
      $scope.underutilizedCSMS[i].activeContracts = query.filterClients([$scope.underutilizedCSMS[i]], {date: new Date, status: 'current', removeOthers: true});
      $scope.underutilizedCSMS[i].activeClients = query.filterClients([$scope.underutilizedCSMS[i]], {date: new Date, status: 'current', removeDuplicates: true, removeOthers: true});
      $scope.underutilizedCSMS[i].available = $scope.underutilizedCSMS[i].csmCapacity - $scope.underutilizedCSMS[i].assigned;
      $scope.avgAvailable += (80 - $scope.underutilizedCSMS[i].assigned)/20;
    }

    // Initialize and Draw Graph
    Highcharts.chart('csmUtilizationPieGraph', {
      chart: {
        type: 'pie',
      },
      title: {
        text: ''
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          slicedOffset: 30,
        },
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          depth: 35,
          dataLabels: {
            enabled: true,
            format: '{point.name} ({point.y})'
          }
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        type: 'pie',
        name: 'Percent of CSMs',
        data: [
          {
            name: "Underutilized",
            color: "#5499C7",
            y: $scope.underutilizedCSMS.length
          },
          {
            name: "100% Utilized",
            color: "#1E8449",
            y: $scope.maxUtilizedCSMS.length
          },
          {
            name: "Overutilized",
            color: "#CB4335",
            y: $scope.overutilizedCSMS.length
          }
        ]
      }]
    });


    // Disable Loader
    $scope.isLoading = false;

    // Get new Data from ETA
    load.fetchFromETA();
    $scope.$apply();
  });

  // Relocate to respective csm infomation page
  $scope.relocate = function(item) {
    if("csmName" in item) {
      window.open(
        '/CSM/' + item.csmName.replace(/ /g, "-"),
        '_blank'
      );
    }
  }

  // Print Function
  $scope.print = function() {
    window.print();
  }


  // Get Today's Date
  $scope.getDate = function() {
    var date = new Date();
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  }


  // Get current month and year
  $scope.getMonthandYear = function() {
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Round Numbers
  $scope.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  // Flip Table Sorting Order
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      return value.substring(1, value.length);
    }
    return "-" + value;
  };

  // Redirect to respective account page on ETA
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }

  // Initialize Table sorting orders
  $scope.csmTableSortingOrder = "csmName";


});
