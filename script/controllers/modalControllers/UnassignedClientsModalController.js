
CSMApp.controller("UnassignedClientsModalController", function($scope, $http, $timeout) {
    $scope.isLoading = true;
    $http.get('https://eta2-api.w3ibm.mybluemix.net/teams/589b900e08916c00353748da/lists/accounts')
    .then(function(object) {
        var teams = object.data.payload;

        $http.get('https://eta2-api.w3ibm.mybluemix.net/clients')
        .then(function(object) {
            var clients = object.data.payload;

            var library = new UsefulFunctions();

            $scope.results = [];

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

            for(var i = 0; i < teams.length; i++) {
                if (teams[i].csmInfo.length == 0) {
                    if (teams[i].initiative.length > 0) {

                        for (var x in teams[i].initiative) {
                            if (teams[i].initiative[x] === 'premsupp') {
                                var obj = {};
                                obj.id = teams[i]._id;
                                obj.clientRegion = teams[i].clientRegion;
                                obj.clientName = fetchClientNameFromID(clients, teams[i].clientId);
                                obj.installType = teams[i].installType;
                                obj.goals = teams[i].goals;
                                obj.dateAdded = teams[i].dateCreated;
                                $scope.results.push(obj);
                            }
                        }
                    }
                }
            }

            $scope.isLoading = false;
        });
    });

    function fetchClientNameFromID(clients, clientID) {
        for(var i = 0; i < clients.length; i++) {
            if(clientID === clients[i]._id) {
                return clients[i].name;
            }
        }
        return undefined;
    }

    $scope.getMonthYearDateFromDate = function(date) {
        var newDate= new Date(date);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getUTCFullYear()}`
    }

    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }

    $timeout(function() {
        $('.ui.long.modal.overutilizedCountries').modal('refresh');
    }, 0);



    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }


    $scope.flipSortOrder = function(value) {
        if (value.includes("-")) {
            return value.substring(1, value.length);
        }
        return "-" + value;
    };

    $scope.viewMoreButton = function(arr) {
        if (arr === undefined) {
            return '';
        }

        if (arr.length - 5 >= 0) {
            return arr.length - 5;
        }
        return '0';
    };

    $scope.viewPDFUnassignedClients = function() {
        window.open(
            '/Reports/UnassignedClientsReport',
            '_blank' // <- This is what makes it open in a new window.
        );
    }

    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }

    $scope.clientTableSortingOrder = 'clientName'

});
