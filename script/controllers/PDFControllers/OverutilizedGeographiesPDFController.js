
CSMApp.controller("OverutilizedGeographiesPDFController", function($scope, $http, $timeout, load) {


  // Library
  var library = new UsefulFunctions();
  var query = new Query();
  var dates = new Dates();

  // Initialize Loader
  $scope.isLoading = true;


  //Get Data
  load.loadData().then(function(data) {

    // Gather CSM Data
    var csmList = data;
    $scope.csms = query.filterCSMS(csmList, {});

    // Disable Loader
    $scope.isLoading = false;

    // Initialize Array
    $scope.overutilizedGeos = [];

    // Gather individual Geo Data
    $scope.americasCSMs = query.filterCSMS($scope.csms, {geo: 'North America'});
    $scope.americasContracts = query.filterClients($scope.csms, {geo: 'North America', date: new Date, status: 'current', removeOthers: true});
    $scope.americasUtil = $scope.round(query.calculateUtilization($scope.americasCSMs, new Date), 2);

    $scope.laCSMs = query.filterCSMS($scope.csms, {geo: 'Latin America'});
    $scope.laContracts = query.filterClients($scope.csms, {geo: 'Latin America', date: new Date, status: 'current', removeOthers: true});
    $scope.laUtil = $scope.round(query.calculateUtilization($scope.laCSMs, new Date),2);

    $scope.emeaCSMs = query.filterCSMS($scope.csms, {geo: 'EMEA'});
    $scope.emeaContracts = query.filterClients($scope.csms, {geo: 'EMEA', date: new Date, status: 'current', removeOthers: true});
    $scope.emeaUtil = $scope.round(query.calculateUtilization($scope.emeaCSMs, new Date), 2);

    $scope.apCSMs = query.filterCSMS($scope.csms, {geo: 'Asia Pacific'});
    $scope.apContracts = query.filterClients($scope.csms, {geo: 'Asia Pacific', date: new Date, status: 'current', removeOthers: true});
    $scope.apUtil = $scope.round(query.calculateUtilization($scope.apCSMs, new Date), 2);
    // End of geo data gathering

    //Determine which Geos are overutilized
    if ($scope.americasUtil > 100) {
      $scope.overutilizedGeos.push({
        name: 'North America',
        csms: $scope.americasCSMs,
        cap: query.calculateCapacity($scope.americasCSMs),
        contracts: $scope.americasContracts,
        assigned: query.calculateAssigned($scope.americasCSMs, new Date),
        util: $scope.americasUtil
      });
    }

    if ($scope.laUtil > 100) {
      $scope.overutilizedGeos.push({
        name: 'Latin America',
        csms: $scope.laCSMs,
        cap: query.calculateCapacity($scope.laCSMs),
        contracts: $scope.laContracts,
        assigned: query.calculateAssigned($scope.laCSMs, new Date),
        util: $scope.laUtil
      });
    }

    if ($scope.emeaUtil > 100) {
      $scope.overutilizedGeos.push({
        name: 'EMEA',
        csms: $scope.emeaCSMs,
        cap: query.calculateCapacity($scope.emeaCSMs),
        contracts: $scope.emeaContracts,
        assigned: query.calculateAssigned($scope.emeaCSMs, new Date),
        util: $scope.emeaUtil
      });
    }

    if ($scope.apUtil > 100) {
      $scope.overutilizedGeos.push({
        name: 'Asia-Pacific',
        csms: $scope.apCSMs,
        cap: query.calculateCapacity($scope.apCSMs),
        contracts: $scope.apContracts,
        assigned: query.calculateAssigned($scope.apCSMs, new Date),
        util: $scope.apUtil
      });
    }
    // End of Overutilized Geos determination

    // Initialize Arrays for Graph
    $scope.geoNames = [];
    $scope.geoUtil = [];
    $scope.geoCap = [];
    $scope.geoAssigned = [];

    // Push data in to arrays for graph and table
    for (var i = 0; i < $scope.overutilizedGeos.length; i++) {
      $scope.geoNames.push($scope.overutilizedGeos[i].name);
      $scope.geoUtil.push($scope.overutilizedGeos[i].util);

      $scope.geoCap.push($scope.overutilizedGeos[i].cap);
      $scope.geoAssigned.push($scope.overutilizedGeos[i].assigned);

      for (var x = 0; x < $scope.overutilizedGeos[i].csms.length; x++) {
        $scope.overutilizedGeos[i].csms[x].util = query.calculateUtilization([$scope.overutilizedGeos[i].csms[x]], new Date);
        $scope.overutilizedGeos[i].csms[x].clients = query.filterClients([$scope.overutilizedGeos[i].csms[x]], {date: new Date, status: 'current', removeOthers: true, removeDuplicates: true});

      }
    }

    // Initialize and draw graph
    $scope.overutilizedGeosGraph = Highcharts.chart('overutilizedGeosChart', {
      chart: {
        type: 'bar'
      },
      title: {
        text: ' ',
      },
      xAxis: {
        categories: [

        ],
        labels: {
          overflow: 'justify'
        }
      },
      credits: {
        enabled: false,
      },
      yAxis: [{
        min: 0,
        title: {
          text: 'Percent Utilized'
        },
      }],
      legend: {
        shadow: false
      },
      tooltip: {
        shared: true,
      },
      plotOptions: {
        bar: {
          shadow: false,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            inside: true,
            formatter: function () {
              return this.series.name + ' - ' + this.y + '%';
            }
          }
        },
      },
    });

    // Set Geo Names as graph x-axis labels
    $scope.overutilizedGeosGraph.xAxis[0].setCategories($scope.geoNames);

    // Add data as series
    $scope.overutilizedGeosGraph.addSeries({
      name: 'Assigned',
      data: $scope.geoAssigned,
      tooltip: {
        valueSuffix: ' %'
      }
    });
    $scope.overutilizedGeosGraph.addSeries({
      name: 'Capacity',
      data: $scope.geoCap,
      tooltip: {
        valueSuffix: ' %'
      }
    });
    // End of adding data as series

    // Get new Data from ETA
    load.fetchFromETA();
    $scope.$apply();
  });

  // Print function
  $scope.print = function() {
    window.print();
  }

  //Relocate to respective Geo Info Pages
  $scope.relocate = function(geo) {
    location.href = '/Geo/' + geo.name.replace(/ /g, "-");
  }

  // Relocate to respective CSM page
  $scope.relocateCSM = function(csm) {
    location.href = '/CSM/' + csm.csmName.replace(/ /g, "-");
  }

  // Get month and year for today
  $scope.getMonthandYear = function() {
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // round numbers
  $scope.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  // Individual Geo Table Sorting Order
  $scope.csmTableSortingOrder = 'csmName';

  // Flip sorting order on table
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      console.log(value);
      return value.substring(1, value.length);
    }
    console.log(value);
    return "-" + value;
  };
});
