CSMApp.controller("ClientsWithoutPremiumSupportTagPDFController", function($scope, $http) {


  // Initialize Loader
  $scope.isLoading = true;

  // Get Account Data
  $http.get('https://eta2-api.w3ibm.mybluemix.net/teams/589b900e08916c00353748da/lists/accounts')
  .then(function(object) {
    var teams = object.data.payload;

    // Get Client Data
    $http.get('https://eta2-api.w3ibm.mybluemix.net/clients')
    .then(function(object) {
      var clients = object.data.payload;


      // Disable Loader
      $scope.isLoading = false;

      // Library
      var library = new UsefulFunctions();
      var query = new Query();


      // Initialize Array
      $scope.results = [];



      // Determine if Clients have CSMs With No Premium Support Tags
      for(var i = 0; i < teams.length; i++) {
        if (teams[i].csmInfo.length > 0) {
          if ((teams[i].initiative.length > 0) && containsActiveContract(teams[i])) {
            var obj = {};
            if (getIndexArray(teams[i].initiative, "premsupp") === -1) {
              var index = getIndexArrayID($scope.results, teams[i]._id);
              if (index === -1) {
                obj.id = teams[i]._id;
                obj.clientRegion = query.mapMarketToRegion(teams[i].clientRegion);;
                obj.clientName = fetchClientNameFromID(clients, teams[i].clientId);
                (obj.clientName + ' -- ' + obj.id);
                obj.installType = teams[i].installType;
                obj.goals = teams[i].goals;
                obj.dateAdded = teams[i].dateCreated;
                obj.csms = [];
                for (var y in teams[i].csmInfo) {
                  var csmIndex = getIndexArrayName(obj.csms, teams[i].csmInfo[y].name);
                  if (csmIndex === -1) {
                    if ((teams[i].csmInfo[y].csmOnboard === undefined || teams[i].csmInfo[y].csmOnboard === null) || (teams[i].csmInfo[y].csmExit === undefined || teams[i].csmInfo[y].csmExit === null)) {
                      obj.csms.push(teams[i].csmInfo[y]);
                    }
                    else if (new Date(new Date(teams[i].csmInfo[y].csmOnboard).toISOString()) <= new Date() && new Date(new Date(teams[i].csmInfo[y].csmExit).toISOString()) >= new Date()) {
                      obj.csms.push(teams[i].csmInfo[y]);
                    }
                  }
                }
                $scope.results.push(obj);
              }
            }
          }
        }
      }


      // Initialize Client Search Dropwdown Menu
      $('#clientsDropdown').dropdown();

      // Get index of value.id in Array arr
      function getIndexArrayID(arr, value) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].id === value) {
            return i;
          }
        }
        return -1;
      }

        // Get index of value.name in Array arr,
      function getIndexArrayName(arr, value) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].name === value) {
            return i;
          }
        }
        return -1;
      }

      // Get index of value in Array arr
      function getIndexArray(arr, value) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] === value) {
            return i;
          }
        }
        return -1;
      }

      // Determine if the client contains an active contract
      function containsActiveContract(client) {
        for (var i in client.csmInfo) {
          if ((client.csmInfo[i].csmOnboard === undefined || client.csmInfo[i].csmOnboard === null) || (client.csmInfo[i].csmExit === undefined || client.csmInfo[i].csmExit === null)) {
            (fetchClientNameFromID(clients, client.clientId));
            return true;
          }
          else if (new Date(new Date(client.csmInfo[i].csmOnboard).toISOString()) <= new Date() && new Date(new Date(client.csmInfo[i].csmExit).toISOString()) >= new Date()) {
            (fetchClientNameFromID(clients, client.clientId));
            return true;
          }
        }
        return false;
      }

    });
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


  // Print Function
  $scope.print = function() {
    window.print();
  }

  // Link to ETA
  $scope.goToETA = function() {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
      '_blank'
    )
  }

  // Flip Table sorting order
  $scope.flipSortOrder = function(value) {
    if (value.includes("-")) {
      return value.substring(1, value.length);
    }
    return "-" + value;
  };

  // Table Sorting Order
  $scope.clientTableSortingOrder = 'clientName'

  // Convert date to string from date object
  $scope.getMonthYearDateFromDate = function(date) {
    var newDate= new Date(date);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getUTCFullYear()}`
  }

  // Redirect to ETA Account Page
  $scope.redirect = function(id) {
    window.open(
      "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
      '_blank'
    )
  }

});
