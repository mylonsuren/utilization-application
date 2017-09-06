CSMApp.controller("CSMsNotLoggedInToETAModalController", function($scope, $http, load) {

    // show loader
    $scope.isLoading = true;

    // library of functions
    var query = new Query();

    // get data
    load.loadData().then(function(data) {

        $scope.data = data;

        // determine which csms have logged in
        $scope.csmsNotLoggedIn = [];
        for(var i = 0; i < $scope.data.length; i++) {
            if(!$scope.data[i].id) $scope.csmsNotLoggedIn.push($scope.data[i]);
        }

        $scope.csms = query.filterClients($scope.csmsNotLoggedIn, {});

        // disable loader
        $scope.isLoading = false;
    });

    // function to get client name from its id
    function fetchClientNameFromID(clients, clientID) {
        for(var i = 0; i < clients.length; i++) {
            if(clientID === clients[i]._id) {
                return clients[i].name;
            }
        }
        return undefined;
    }

    // print function
    $scope.print = function() {
        window.print();
    }

    // Link to ETA Main page
    $scope.goToETA = function() {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/?_k=sbjvhu",
            '_blank'
        )
    }

    // Flip sort order of table
    $scope.flipSortOrder = function(value) {
        if (value.includes("-")) {
            return value.substring(1, value.length);
        }
        return "-" + value;
    };

    // refresh modal
    $('.ui.long.modal.CSMsNoPremiumSupportTag').modal('refresh');

    // determine when modal has loaded
    $scope.$on('modal coming in', function(e) {
    });

    // close modal function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }

    // initialize table sort order
    $scope.clientTableSortingOrder = 'csm'

    // function to get convert date object to formatted string
    $scope.getMonthYearDateFromDate = function(date) {
        var newDate= new Date(date);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[newDate.getUTCMonth()]} ${newDate.getUTCDate()}, ${newDate.getUTCFullYear()}`
    }

    // determine how many csms have not logged in, that are also not appearing on the modal
    $scope.viewMoreButtonPremSupport = function(arr) {
        if (arr === undefined) {
            return '';
        }
        if (arr.length - 5 >= 0) {
            return arr.length - 5;
        }
        return '0';
    };

    // link to main report page
    $scope.viewPDFCSMsNotLoggedIn = function() {
        window.open(
            '/Reports/CSMsNotLoggedInToETAReport',
            '_blank' // <- This is what makes it open in a new window.
        );
    }

    // redirect client selection to account page on ETA
    $scope.redirect = function(id) {
        window.open(
            "https://eta2.w3ibm.mybluemix.net/#/t/cloud-adoption/accounts/" + id,
            '_blank'
        )
    }
});
