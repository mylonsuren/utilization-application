CSMApp.controller("APModalController", function($scope, load) {

    // Library of Useful Functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    $scope.library = library;

    // Initialize Loader
    $scope.isLoading = true;

    // Get Data
    load.loadData().then(function(data) {

        // Gather CSM Data
        $scope.csmList = data;

        // Gather CSMs, Overutilized CSMs, and Statistics for the Region
        $scope.regionCSMs = query.filterCSMS($scope.csmList, {geo: 'Asia Pacific'});
        $scope.overutilizedCSMs = query.filterCSMS($scope.csmList, {geo: 'Asia Pacific', isOverutilized: true});
        $scope.geoCapacity = query.calculateCapacity($scope.regionCSMs);
        $scope.geoAssignments = query.calculateAssigned($scope.regionCSMs, new Date());
        $scope.geoUtil = $scope.round(query.calculateAssignedUtilization($scope.regionCSMs, new Date), 2);
        $scope.geoActualUtil = $scope.round(query.calculateUtilization($scope.regionCSMs, new Date), 2);
        $scope.workEffort = query.calculateCSMWorkEffort($scope.regionCSMs);
        $scope.numberOfContracts = query.filterClients($scope.csmList, {status: 'current', date: new Date, geo: 'Asia Pacific', removeOthers: true}).length;
        $scope.regionClients = query.filterClients($scope.csmList, {geo: 'Asia Pacific',removeDuplicates: true, removeOthers: true});
        $scope.numberOfClients = $scope.regionClients.length;

        // Disable Loader
        $scope.isLoading = false;

    });

    // Close Modal Function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }

    // Determines whether to show subscription based statistics or CSM based statistics
    $scope.units = true; //true will represent subscriptions, false will represent csms

    // Toggle between subscription based statistics and CSM based statistics
    $scope.toggleUnits = function() {
        $scope.units = !$scope.units;
    }

    // Function to round numbers
    $scope.round = function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }
});
