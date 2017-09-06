CSMApp.controller("CSMsNotLoggedInToETAPDFController", function($scope, $http, load) {

  // Initialize Loader
  $scope.isLoading = true;

  // Library of Useful Functions
  var query = new Query();

  // Get Data
  load.loadData().then(function(data) {
    $scope.data = data;

    // Determine if CSMs are not logged in to the ETA System
    $scope.csmsNotLoggedIn = [];
    for(var i = 0; i < $scope.data.length; i++) {
      if(!$scope.data[i].id) $scope.csmsNotLoggedIn.push($scope.data[i]);
    }

    //Determine accounts with CSMs that have not logged in
    $scope.csms = query.filterClients($scope.csmsNotLoggedIn, {});

    // Get new Data from ETA
    load.fetchFromETA();

    // Disable Loader
    $scope.isLoading = false;

    // Apply Changes
    $scope.$apply();
  });

  // Function to get Client Name from it's ID
  function fetchClientNameFromID(clients, clientID) {
    for(var i = 0; i < clients.length; i++) {
      if(clientID === clients[i]._id) {
        return clients[i].name;
      }
    }
    return undefined;
  }

  // Print function
  $scope.print = function() {
    window.print();
  }

  // Link to ETA Main Page
  $scope.goToETA = function() {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
      '_blank'
    )
  }

  // Flip Table Sorting Order
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      return value.substring(1, value.length);
    }
    return "-" + value;
  };


  // Initialize Table Sorting Order
  $scope.clientTableSortingOrder = 'clientName'

  // Convert date object to formatted String
  $scope.getMonthYearDateFromDate = function(date) {
    var newDate= new Date(date);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getUTCFullYear()}`
  }

  // Redirect to Client's Account page on ETA
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }

});
