
CSMApp.controller("OverutilizedGeographiesModalController", function($scope, $http, $timeout, load) {

    // library of functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    // show loader
    $scope.isLoading = true;

    // get data
    load.loadData().then(function(data) {

        // gather csm data
        $scope.csmList = data;

        // hide loader
        $scope.isLoading = false;

        $scope.overutilizedGeos = [];

        // Get Geo Information
        $scope.naCSMs = query.filterCSMS($scope.csmList, {geo: 'North America'});
        $scope.naContracts = query.filterClients($scope.csmList, {geos: ["North America"], date: new Date, status: 'current'});
        $scope.naUtil = $scope.round(query.calculateUtilization($scope.naCSMs, new Date), 2);

        $scope.laCSMs = query.filterCSMS($scope.csmList, {geo: 'Latin America'});
        $scope.laContracts = query.filterClients($scope.csmList, {geos: ["Latin America"], date: new Date, status: 'current'});
        $scope.laUtil = $scope.round(query.calculateUtilization($scope.laCSMs, new Date),2);


        $scope.emeaCSMs = query.filterCSMS($scope.csmList, {geo: 'EMEA'});
        $scope.emeaContracts = query.filterClients($scope.csmList, {geos: ['EU', 'EMEA'], date: new Date, status: 'current'});
        $scope.emeaUtil = $scope.round(query.calculateUtilization($scope.emeaCSMs, new Date), 2);


        $scope.apCSMs = query.filterCSMS($scope.csmList, {geo: 'Asia Pacific'});
        $scope.apContracts = query.filterClients($scope.csmList, {geos: ["Asia Pacific"], date: new Date, status: 'current'});
        $scope.apUtil = $scope.round(query.calculateUtilization($scope.apCSMs, new Date), 2);

        // determine which geos are overutilized

        if ($scope.americasUtil > 100) {
            $scope.overutilizedGeos.push({
                name: 'Americas',
                csms: $scope.americasCSMs,
                cap: query.calculateCapacity($scope.americasCSMs),
                contracts: $scope.americasContracts,
                assigned: query.calculateAssigned($scope.americasCSMs, new Date),
                util: $scope.americasUtil
            });
        }

        if ($scope.laUtil > 100) {
            $scope.overutilizedGeos.push({
                name: 'Latin America',
                csms: $scope.laCSMs,
                cap: query.calculateCapacity($scope.laCSMs),
                contracts: $scope.laContracts,
                assigned: query.calculateAssigned($scope.laCSMs, new Date),
                util: $scope.laUtil
            });
        }

        if ($scope.emeaUtil > 100) {
            $scope.overutilizedGeos.push({
                name: 'EMEA',
                csms: $scope.emeaCSMs,
                cap: query.calculateCapacity($scope.emeaCSMs),
                contracts: $scope.emeaContracts,
                assigned: query.calculateAssigned($scope.emeaCSMs, new Date),
                util: $scope.emeaUtil
            });
        }

        if ($scope.apUtil > 100) {
            $scope.overutilizedGeos.push({
                name: 'Asia-Pacific',
                csms: $scope.apCSMs,
                cap: query.calculateCapacity($scope.apCSMs),
                contracts: $scope.apContracts,
                assigned: query.calculateAssigned($scope.apCSMs, new Date),
                util: $scope.apUtil
            });
        }

        $scope.geoNames = [];
        $scope.geoUtil = [];
        $scope.geoCap = [];
        $scope.geoAssigned = [];

        for (var i = 0; i < $scope.overutilizedGeos.length; i++) {
            $scope.geoNames.push($scope.overutilizedGeos[i].name);
            $scope.geoUtil.push($scope.overutilizedGeos[i].util);

            $scope.geoCap.push($scope.overutilizedGeos[i].cap);
            $scope.geoAssigned.push($scope.overutilizedGeos[i].assigned);

            for (var x = 0; x < $scope.overutilizedGeos[i].csms.length; x++) {
                $scope.overutilizedGeos[i].csms[x].util = query.calculateUtilization([$scope.overutilizedGeos[i].csms[x]], new Date);
                $scope.overutilizedGeos[i].csms[x].clients = query.filterClients([$scope.overutilizedGeos[i].csms[x]], {date: new Date, status: 'current', removeOthers: true, removeDuplicates: true});
            }
        }


        // draw graph
        $scope.overutilizedGeosGraph = Highcharts.chart('overutilizedGeosChart', {
            chart: {
                type: 'bar'
            },
            title: {
                text: ' ',
            },
            xAxis: {
                categories: [

                ],
                labels: {
                    overflow: 'justify'
                }
            },
            credits: {
                enabled: false,
            },
            yAxis: [{
                min: 0,
                title: {
                    text: 'Percent Utilized'
                }
            }],
            legend: {
                shadow: false
            },
            tooltip: {
                shared: true,
            },
            plotOptions: {
                bar: {
                    shadow: false,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        inside: true,
                        formatter: function () {
                            return this.series.name + ' - ' + this.y + '%';
                        }
                    }
                },
            },
        });

        // add series and labels
        $scope.overutilizedGeosGraph.xAxis[0].setCategories($scope.geoNames);
        $scope.overutilizedGeosGraph.addSeries({
            name: 'Assigned',
            data: $scope.geoAssigned,
            tooltip: {
                valueSuffix: ' %'
            }
        });
        $scope.overutilizedGeosGraph.addSeries({
            name: 'Capacity',
            data: $scope.geoCap,
            tooltip: {
                valueSuffix: ' %'
            }
        });

        // refresh modal
        $('.ui.long.modal.overutilizedGeos').modal('refresh');

    });


    // print function
    $scope.print = function() {
        window.print();
    }

    // get current month and year as a formatted string
    $scope.getMonthandYear = function() {
        var date = new Date();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
        return `${months[date.getMonth()]} ${date.getFullYear()}`
    }

    // round numbers
    $scope.round = function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    // link to respective geo information page
    $scope.relocate = function(geo) {
        location.href = '/Geo/' + geo.geoName.replace(/ /g, "-");
    }

    // refresh once modal is loaded
    $scope.$on('modal coming in', function(e) {
        $('.ui.long.modal.overutilizedGeos').modal('refresh');
    });

    // close modal function
    $scope.closeModal = function() {
        $('.ui.long.modal')
        .modal('hide');
    }

});
