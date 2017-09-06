CSMApp.controller("ClientUsageModalController", function($scope, $http, load) {

    // Initialize Loader
    $scope.creatingEvent = true;

    // Library of functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    // get data
    load.loadData().then(function(data) {

        // gather csm data
        $scope.csms = data;

        // disable loader
        $scope.creatingEvent = false;

        // refresh modal
        $('.ui.long.modal.ClientUsageReport').modal('refresh');

        // function to get index of value in array of contract objects
        function getIndexArrayContracts (arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id === value) {
                    return i;
                }
            }
            return -1;
        }

        // function to get index of value in array
        function getIndexArray(arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }
            return -1;
        }

        // determine all active clients and contracts
        $scope.clients = query.filterClients($scope.csms, {date: new Date(), status: 'current', removeOthers: true, removeDuplicates: true});
        $scope.contracts = query.filterClients($scope.csms, {date: new Date, status: 'current', removeOthers: true});

        // Ensure that totalPurchased exists
        for (var x in $scope.clients) {
            if ($scope.clients[x].totalPurchased == null) {
                $scope.clients[x].totalPurchased = 0;
            }
        }

        // Determine average client purchase
        $scope.avgClientPurchase = 0;
        for (var i = 0; i < $scope.clients.length; i++) {
            $scope.avgClientPurchase += $scope.clients[i].totalPurchased;
        }
        $scope.avgClientPurchase = $scope.round($scope.avgClientPurchase/$scope.clients.length, 2);

    });

    // print function
    $scope.print = function() {
        window.print();
    }


    // gets current date in a formatted string
    $scope.getDate = function() {
        var date = new Date();
        return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
    }

    // function that rounds numbers
    $scope.round = function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    // gets current month and year in a formatted string
    $scope.getMonthandYear = function() {
        var date = new Date();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[date.getMonth()]} ${date.getFullYear()}`
    }

    // converts date object to a formatted string
    $scope.getMonthYearDateFromDate = function(date) {
        var newDate = new Date(date);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getFullYear()}`
    }

    // determines when modal has loaded, and refreshes modal
    $scope.$on('modal coming in', function(e) {
        $('.ui.long.modal.ClientUsageReport').modal('refresh');

    });

    // close modal function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide')
        ;
    }

    // redirects clients to their account page on ETA
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }

});
