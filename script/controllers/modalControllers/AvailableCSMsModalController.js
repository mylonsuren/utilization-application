CSMApp.controller("AvailableCSMsModalController", function($scope, $http, load) {

    // Library of Functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    // Initialize Loader
    $scope.isLoading = true;

    // Get Data
    load.loadData().then(function(data) {

        // Gather CSM Data
        $scope.csmList = data;

        // Determine Available CSMs
        $scope.underutilizedCSMS = query.filterCSMS($scope.csmList, {isUnderutilized: true});

        // Disable Loader
        $scope.isLoading = false;

        // Limit Table to only showing 5 CSMs
        $scope.limit = 5;


        $scope.noContractCSMS = [];
        $scope.avgAvailable = 0;

        // Determine active clients, and the average availability across all CSMs
        for (var i = 0; i < $scope.underutilizedCSMS.length; i++) {
            if($scope.underutilizedCSMS[i].assigned === 0) {
                $scope.noContractCSMS.push($scope.underutilizedCSMS[i]);
            }
            $scope.underutilizedCSMS[i].activeContracts = query.filterClients([$scope.underutilizedCSMS[i]], {date: new Date, status: 'current', removeOthers: true});
            $scope.underutilizedCSMS[i].activeClients = query.filterClients([$scope.underutilizedCSMS[i]], {date: new Date, status: 'current', removeDuplicates: true, removeOthers: true});
            $scope.underutilizedCSMS[i].available = $scope.underutilizedCSMS[i].csmCapacity - $scope.underutilizedCSMS[i].assigned;
            $scope.avgAvailable += ($scope.underutilizedCSMS[i].csmCapacity - $scope.underutilizedCSMS[i].assigned)/20;
        }
    });


    // Close Modal Function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }

    //Relocate to respective CSM Info Page
    $scope.relocate = function(item) {
        if ("csmName" in item) {
            window.open(
                '/CSM/' + item.csmName.replace(/ /g, "-"),
                '_blank'
            );
        }
    }

    // Redirect to the client's respective account page on ETA
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }

    // Function to round numbers
    $scope.round = function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    // Determines when the modal has loaded
    $scope.$on('modal coming in', function(e) {
    });
});
