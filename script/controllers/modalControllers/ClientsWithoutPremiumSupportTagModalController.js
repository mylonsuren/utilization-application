CSMApp.controller("ClientsWithoutPremiumSupportTagModalController", function($scope, $http) {

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

            // Library of Functions
            var library = new UsefulFunctions();
            var query = new Query();

            // Determine which clients are without premium support tags
            $scope.premSupportTagClients = [];
            for(var i = 0; i < teams.length; i++) {
                if (teams[i].csmInfo.length > 0) {
                    if ((teams[i].initiative.length > 0) && containsActiveContract(teams[i])) {
                        var obj = {};
                        if (getIndexArray(teams[i].initiative, "premsupp") === -1) {
                            var index = getIndexArrayID($scope.premSupportTagClients, teams[i]._id);
                            if (index === -1) {
                                obj.id = teams[i]._id;
                                obj.clientRegion = query.mapMarketToRegion(teams[i].clientRegion);;
                                obj.clientName = fetchClientNameFromID(clients, teams[i].clientId);
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
                                $scope.premSupportTagClients.push(obj);
                            }
                        }
                    }
                }
            }


            // Function that gets the index of the value (id), in the array
            function getIndexArrayID(arr, value) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id === value) {
                        return i;
                    }
                }
                return -1;
            }

            // Function that gets the index of the value (name), in the array
            function getIndexArrayName(arr, value) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].name === value) {
                        return i;
                    }
                }
                return -1;
            }

            // Function that gets the index of the value, in the array
            function getIndexArray(arr, value) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === value) {
                        return i;
                    }
                }
                return -1;
            }

            // Function that determines if the specified client has an active contract
            function containsActiveContract(client) {
                for (var i in client.csmInfo) {
                    if ((client.csmInfo[i].csmOnboard === undefined || client.csmInfo[i].csmOnboard === null) || (client.csmInfo[i].csmExit === undefined || client.csmInfo[i].csmExit === null)) {
                        return true;
                    }
                    else if (new Date(new Date(client.csmInfo[i].csmOnboard).toISOString()) <= new Date() && new Date(new Date(client.csmInfo[i].csmExit).toISOString()) >= new Date()) {
                        return true;
                    }
                }
                return false;
            }

            // Disables Loader
            $scope.isLoading = false;
        });
    })
    .catch(function(error) {
        console.log("Error: " + error);
    });

    // Function that gets client name from its ID
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

    // Links to ETA Main Page
    $scope.goToETA = function() {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
            '_blank'
        )
    }


    // Refresh Modal
    $('.ui.long.modal.CSMsNoPremiumSupportTag').modal('refresh');

    // Determine if modal is loaded
    $scope.$on('modal coming in', function(e) {
    });

    // Close Modal function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }


    // Function to convert date object to formatted string
    $scope.getMonthYearDateFromDate = function(date) {
        var newDate= new Date(date);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getUTCFullYear()}`
    }

    // Determine how many clients are not being shown on modal
    $scope.viewMoreButtonPremSupport = function(arr) {
        if (arr === undefined) {
            return '';
        }
        if (arr.length - 5 >= 0) {
            return arr.length - 5;
        }
        return '0';
    };

    // Link to main report page
    $scope.viewPDFPremiumSupportTag = function() {
        window.open(
            '/Reports/ClientsWithoutPremiumSupportTagReport',
            '_blank' // <- This is what makes it open in a new window.
        );
    }

    // Redirect to clients ETA page
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }

});
