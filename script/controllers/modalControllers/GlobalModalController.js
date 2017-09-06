CSMApp.controller("GlobalModalController", function($scope, load) {

    // library of functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    // show loader
    $scope.isLoading = true;
    $scope.library = library;

    // get data
    load.loadData().then(function(data) {

        // gather csm data
        $scope.csmList = data;

        // Gather CSMs, Overutilized CSMs, and Statistics for the Region
        $scope.regionCSMs = query.filterCSMS($scope.csmList, {});
        $scope.overutilizedCSMs = query.filterCSMS($scope.csmList, {isOverutilized: true});
        $scope.geoCapacity = query.calculateCapacity($scope.regionCSMs);
        $scope.geoAssignments = query.calculateAssigned($scope.regionCSMs, new Date());
        $scope.geoUtil = $scope.round(query.calculateAssignedUtilization($scope.regionCSMs, new Date), 2);
        $scope.geoActualUtil = $scope.round(query.calculateUtilization($scope.regionCSMs, new Date), 2);
        $scope.workEffort = query.calculateCSMWorkEffort($scope.regionCSMs);
        $scope.numberOfContracts = query.filterClients($scope.csmList, {status: 'current', date: new Date, removeOthers: true}).length;
        $scope.regionClients = query.filterClients($scope.csmList, {status: 'current', date: new Date, removeDuplicates: true, removeOthers: true});
        $scope.numberOfClients = $scope.regionClients.length;

        // hide loader
        $scope.isLoading = false;

        // refresh modal
        $('.ui.long.modal.GlobalReport').modal('refresh');
    });


    // close modal function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }

    // Determines whether to show subscription based statistics or CSM based statistics
    $scope.units = true;

    // Toggle between subscription based statistics and CSM based statistics
    $scope.toggleUnits = function() {
        $scope.units = !$scope.units;
    }

    // function to round numbers
    $scope.round = function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

});
