CSMApp.controller("OverusingClientsPDFController", function($scope, $http, $timeout, load) {

  // Library
  var library = new UsefulFunctions();
  var query = new Query();
  var dates = new Dates();

  // When true, Loader displays on page
  $scope.isLoading = true;


  // Get Data
  load.loadData().then(function(data) {

    // Loader is disabled once data is retrieved
    $scope.isLoading = false;

    //Gather CSM data
    var csmList = data;
    $scope.csms = query.filterCSMS(csmList, {});


    //Initialize Arrays
    $scope.overusingClients = [];
    $scope.overusingClientNames = [];
    $scope.purchased = [];
    $scope.csmList = [];
    $scope.recieved = [];

    //Determine Overusing Clients and push them to appropriate Array
    for (var i = 0; i < $scope.csms.length; i++) {
      for (var x = 0; x < $scope.csms[i].clients.length; x++) {
        if (($scope.csms[i].clients[x].percentTimeSpent > $scope.csms[i].clients[x].clientCapacity)) {
          if (query.isEngagementCurrent(new Date($scope.csms[i].clients[x].clientStart), new Date($scope.csms[i].clients[x].clientEnd))) {

            $scope.overusingClients.push($scope.csms[i].clients[x]);
            $scope.purchased.push($scope.csms[i].clients[x].clientCapacity);
            $scope.recieved.push($scope.csms[i].clients[x].percentTimeSpent);
            $scope.overusingClientNames.push($scope.csms[i].clients[x].clientName);
            $scope.csmList.push($scope.csms[i]);
          }
        }
      }
    }

    // Determine Height of Bar Chart
    function calcHeight() {
      if ($scope.overusingClients.length < 25) {
        return '750px;'
      }
      else if ($scope.overusingClients.length < 30) {
        return 80*c$scope.overusingClients.length;
      }
      else if (100*$scope.overusingClients.length > 1000) {
        return 150*$scope.overusingClients.length;
      }
    }


    //Initialize and Draw Overusing Clients Graph
    $scope.overusingClientsChart = Highcharts.chart('overUsingClients', {
      chart: {
        type: 'bar',
        height: calcHeight(),
      },
      title: {
        text: ' ',
        position: 'none'
      },
      xAxis: {
        categories: [],
        labels: {
          overflow: 'justify'
        }
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
      credits: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          // grouping: false,
          shadow: false,
          borderWidth: 0,
          dataLabels: {
            enabled: true
          }
        },
        series: {
          dataLabels: {
            animation: false,
            enabled: true,
            inside: true,
            formatter: function() {
              return this.series.name + ': ' + this.y + '%'
            }
          },
          pointPadding: 0,
          groupPadding: 0.1,
        }
      },
    });

    //Set x-axis categories (Clients)
    $scope.overusingClientsChart.xAxis[0].setCategories($scope.overusingClientNames);

    //Add series to graph (Amount Purchased and Amount Received)
    $scope.overusingClientsChart.addSeries({
      name: 'Purchased',
      color: 'rgba(248,161,63,1)',
      data: $scope.purchased,
      // pointPadding: 0.2,
      // pointPlacement: -0.2,
      tooltip: {
        valueSuffix: ' %'
      }
    });
    $scope.overusingClientsChart.addSeries({
      name: 'Received',
      color: 'rgba(186,60,61,.9)',
      data: $scope.recieved,
      // pointPadding: 0.4,
      // pointPlacement: -0.2,
      tooltip: {
        valueSuffix: ' %'
      }
    });

    //Get new Data from ETA
    load.fetchFromETA();
    $scope.$apply();
  })

  //Print function
  $scope.print = function() {
    window.print();
  }


  //Determine Screenwidth
  $scope.screenWidth = window.screen.availWidth;


  //Get String Date from Date object
  $scope.getDate = function() {
    var date = new Date();
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  }


  //Function that rounds numbers
  $scope.round = function (value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  //Get month and year for today
  $scope.getMonthandYear = function() {
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  //Get month and year from date object
  $scope.getMonthYearDateFromDate = function(date) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
    return `${months[date.getMonth()]} ${date.getUTCDate()}, ${date.getFullYear()}`
  }

  //Link CSM to their respective CSM Info Page
  $scope.relocate = function(item) {
    location.href = '/CSM/' + item.csmName.replace(/ /g, "-");
  }

  //Link Client to their account page on ETA
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }

});
