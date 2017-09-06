CSMApp.controller("OverusingClientsModalController", function($scope, $http, $timeout, load) {


    // library of functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    // show loader
    $scope.isLoading = true;

    // get data
    load.loadData().then(function(data) {

        // hide loader
        $scope.isLoading = false;

        // gather csm data
        var csmList = data;
        $scope.csms = query.filterCSMS(csmList, {});

        // determine which clients are overusing their premium support
        $scope.overusingClients = [];
        $scope.overusingClientNames = [];
        $scope.purchased = [];
        $scope.csmList = [];
        $scope.recieved = [];

        for (var i = 0; i < $scope.csms.length; i++) {
            for (var x = 0; x < $scope.csms[i].clients.length; x++) {
                if (($scope.csms[i].clients[x].percentTimeSpent > $scope.csms[i].clients[x].clientCapacity)) {
                    if (query.isEngagementCurrent(new Date($scope.csms[i].clients[x].clientStart), new Date($scope.csms[i].clients[x].clientEnd))) {
                        $scope.overusingClients.push($scope.csms[i].clients[x]);
                        $scope.purchased.push($scope.csms[i].clients[x].clientCapacity);
                        $scope.recieved.push($scope.csms[i].clients[x].percentTimeSpent);
                        $scope.overusingClientNames.push($scope.csms[i].clients[x].clientName);
                        $scope.csmList.push($scope.csms[i]);
                    }
                }
            }
        }


        // refresh modal
        $timeout(function() {
            $('.ui.long.modal.overusingClients').modal('refresh');
        }, 0);
        $scope.$on('modal coming in', function(e) {
        });

        // close modal function
        $scope.closeModal = function() {
            $('.ui.long.modal.overusingClients').modal('hide');
        }

        // refresh modal
        $('.ui.long.modal.overusingClients').modal('refresh');

    });


    // determine how many clients are not showing up on modal
    $scope.viewMoreButton = function(arr) {
        if (arr === undefined) {
            return '';
        }

        if (arr.length - 5 >= 0) {
            return arr.length - 5;
        }
        return '0';
    }

    // link to main report page
    $scope.viewPDFOverusingClients = function() {
        window.open(
            '/Reports/OverusingClientsReport',
            '_blank' // <- This is what makes it open in a new window.
        );
    }

    // relocate to csm info page
    $scope.relocate = function(item) {
        location.href = '/CSM/' + item.csmName.replace(/ /g, "-");
    }

    // redirect to clients eta account page
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }
});
