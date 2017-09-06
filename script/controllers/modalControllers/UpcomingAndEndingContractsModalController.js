CSMApp.controller("UpcomingAndEndingContractsModalController", function($scope, $http, $timeout, load) {


    // show loader
    $scope.creatingEvent = true;

    // library of functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();


    // get data
    load.loadData().then(function(data) {

        // gather csm data
        var csmList = data;
        $scope.csms = query.filterCSMS(csmList, {});

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

        $scope.contractTypes = [];
        $scope.searchContracts = '';

        // get all current clients
        $scope.clients = query.filterClients($scope.csms, {date: new Date(), status: 'current', removeOthers: true, removeDuplicates: true});
        // get all current contracts
        $scope.contracts = query.filterClients($scope.csms, {date: new Date, status: 'current', removeOthers: true});

        // ensure that totalPurchased exists
        for (var x in $scope.clients) {
            if ($scope.clients[x].totalPurchased == null) {
                $scope.clients[x].totalPurchased = 0;
            }
        }

        // Determine which contracts start and end within 6 months
        $scope.startingMonth = [];
        $scope.endingMonth = [];
        $scope.endingMonthAffectedCSMS = [];
        $scope.startingMonthAffectedCSMS = [];

        $scope.searchGeos = [];
        $scope.searchRoles = [];

        $scope.months = [];
        var currentDate = new Date();

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
                var currentDay = currentDate.getUTCDate();

                var sixMonths = new Date(currentDate.getUTCMonth() + 6);;

                var clientStart = new Date($scope.csms[i].clients[x].clientStart);
                var clientStartMonth = clientStart.getUTCMonth();
                var clientStartYear = clientStart.getFullYear();
                var clientStartDay = clientStart.getUTCDate();
                clientStart = new Date(clientStartYear, clientStartMonth, clientStartDay);

                if ((clientStart >= currentDate) &&(clientStartMonth >= currentMonth && clientStartMonth <= sixMonths) && (clientStartYear == currentYear) && $scope.csms[i].clients[x].role != 'Other') {

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
                        startDate: new Date($scope.csms[i].clients[x].clientStart),

                    });

                    var csmIndex = getIndexArray($scope.startingMonthAffectedCSMS, $scope.csms[i].csmName);
                    if (csmIndex === -1) {
                        $scope.startingMonthAffectedCSMS.push($scope.csms[i].csmName);
                    }

                }

                var clientEnd = new Date($scope.csms[i].clients[x].clientEnd);
                var clientEndMonth = clientEnd.getUTCMonth();
                var clientEndYear = clientEnd.getFullYear();
                var clientEndDay = clientEnd.getUTCDate();
                clientEnd = new Date(clientEndYear, clientEndMonth, clientEndDay);

                if ((clientEnd >= currentDate) && (clientEndMonth >= currentMonth && clientEndMonth <= sixMonths) && (clientEndYear == currentYear) && $scope.csms[i].clients[x].role != 'Other') {
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
                        endDate: new Date($scope.csms[i].clients[x].clientEnd),

                    });

                    var csmIndex = getIndexArray($scope.endingMonthAffectedCSMS, $scope.csms[i].csmName);
                    if (csmIndex === -1) {
                        $scope.endingMonthAffectedCSMS.push($scope.csms[i].csmName);
                    }
                }
            }

        }


        // get new data from eta
        load.fetchFromETA();

        // hide loader
        $scope.creatingEvent = false;
        $scope.$apply();
    })


    // get screenwidth
    $scope.screenWidth = window.screen.availWidth;





    // refresh modal once loaded
    $scope.$on('modal coming in', function(e) {
        $('.ui.long.modal.UpcomingContracts').modal('refresh');
    });

    // close modal function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide')
        ;
    }

    // redirect to clients eta page
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }
});
