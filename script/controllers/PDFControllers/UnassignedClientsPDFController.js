CSMApp.controller("UnassignedClientsPDFController", function($scope, $http, load) {

  // Initialize Loader
  $scope.isLoading = true;

  //Get Account Data from ETA
  $http.get('https://eta2-api.w3ibm.mybluemix.net/teams/589b900e08916c00353748da/lists/accounts')
  .then(function(object) {
    var teams = object.data.payload;

    // Get Client Data from ETA
    $http.get('https://eta2-api.w3ibm.mybluemix.net/clients')
    .then(function(object) {
      var clients = object.data.payload;

      // Library
      var library = new UsefulFunctions();

      // Initialize Array
      $scope.results = [];

      // Determine Fields in CSM Information on ETA
      var fields = {
        "csmRole" : "Role",
        "csmOnboard" : "CSM On-Board",
        "contractType" : "Contract Type",
        "csmCapacity" : "Capacity (The level of Premium Support i.e. 20%)",
        "csmStatus" : "Status",
        "csmExit" : "CSM Exit",
        "csmRegion" : "Region",
        "csmPercentTimeSpent" : "% Time Spent",
      }

      // Determine which accounts don't have csms assigned
      for(var i = 0; i < teams.length; i++) {
        if (teams[i].csmInfo.length == 0) {
          if (teams[i].initiative.length > 0) {
            var obj = {};
            for (var x in teams[i].initiative) {
              if (teams[i].initiative[x] === 'premsupp') {
                obj.id = teams[i]._id;

                obj.clientRegion = teams[i].clientRegion;
                obj.clientName = fetchClientNameFromID(clients, teams[i].clientId);
                console.log(obj.clientName + ' -- ' + obj.id);
                obj.installType = teams[i].installType;
                obj.goals = teams[i].goals;
                obj.dateAdded = teams[i].dateCreated;
                $scope.results.push(obj);
              }
            }
          }
        }
      }

      // Initialize Client Search Dropdown Menu
      $('#clientsDropdown').dropdown();

      // Disable Loader
      $scope.isLoading = false;

    });
  })
  .catch(function(error) {
    console.log("Error: " + error);
  });

  // Get Client Name from its ID
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

  // Link each client to its ETA Page
  $scope.goToETA = function() {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
      '_blank'
    )
  }

  // Flip the current sort order
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      console.log(value);
      return value.substring(1, value.length);
    }
    console.log(value);
    return "-" + value;
  };

  // Table Sort Order
  $scope.clientTableSortingOrder = 'clientName'

  // Get Month and Year from a date object
  $scope.getMonthYearDateFromDate = function(date) {
    var newDate= new Date(date);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getUTCFullYear()}`
  }

  // Redirect to respective ETA Account
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }

});
