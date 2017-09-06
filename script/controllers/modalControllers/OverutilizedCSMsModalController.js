CSMApp.controller("OverutilizedCSMsModalController", function($scope, $http, $timeout, load) {

    // librayr of functions
    var library = new UsefulFunctions();
    var query = new Query();
    var dates = new Dates();

    // show loader
    $scope.isLoading = true;

    // get data
    load.loadData().then(function(data) {

        // gather csm data
        $scope.csmList = data;

        // determine which csms are overutilized
        $scope.overUtilizedCSMS = query.filterCSMS($scope.csmList, {isOverutilized: true});
        $scope.isLoading = false;

        $scope.csmsNames = [];
        $scope.csmsAssigned = [];
        $scope.csmsWorkEffort = [];
        $scope.csmsCap = [];

        for (var i = 0; i < $scope.overUtilizedCSMS.length; i++) {
            $scope.csmsWorkEffort.push($scope.overUtilizedCSMS[i].workEffort);
            $scope.csmsNames.push($scope.overUtilizedCSMS[i].csmName);
            $scope.csmsAssigned.push($scope.overUtilizedCSMS[i].assigned);
            $scope.csmsCap.push($scope.overUtilizedCSMS[i].csmCapacity);
        }

        // draw graph
        $( document ).ready(function() {
            $scope.overutilzedCSMChart = Highcharts.chart('overutilzedCSMChart', {
                chart: {
                    type: 'bar',
                    height: $scope.overUtilizedCSMS.length * 200
                },
                title: {
                    text: ' ',
                    position: 'none'
                },
                xAxis: {
                    categories: [],
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
                    },
                    plotLines: [{
                        color: 'red', // Color value
                        dashStyle: 'solid', // Style of the plot line. Default to solid
                        value: 100, // Value of where the line will appear
                        width: 2 // Width of the line
                    }],

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
                            enabled: true
                        }
                    },
                    series: {
                        dataLabels: {
                            animation: false,
                            enabled: true,
                            inside: true,
                            formatter: function() {
                                return this.series.name + ': ' + this.y + '%'
                            }
                        },
                        pointPadding: 0,
                        groupPadding: 0.1,
                    }
                }
            });

            // add series, and labels
            $scope.overutilzedCSMChart.xAxis[0].setCategories($scope.csmsNames);
            $scope.overutilzedCSMChart.addSeries({
                name: 'Work Effort',
                color: 'rgba(192, 57, 43, .9)',
                data:   $scope.csmsWorkEffort,
                tooltip: {
                    valueSuffix: ' %'
                }
            });
            $scope.overutilzedCSMChart.addSeries({
                name: 'Assigned',
                color: 'rgba(248,161,63,1)',
                data:   $scope.csmsAssigned,
                tooltip: {
                    valueSuffix: ' %'
                }
            });
            $scope.overutilzedCSMChart.addSeries({
                name: 'Capacity',
                color: 'rgba(46, 134, 193, 1)',
                data:   $scope.csmsCap,
                tooltip: {
                    valueSuffix: ' %'
                }
            });


        });

        // refresh modal once it is loaded
        $scope.$on('modal coming in', function(e) {
            $timeout(function() {
                $('.ui.long.modal.overutilizedCSMs').modal('refresh');
            }, 0);

        });

        // refresh modal
        $('.ui.long.modal.overutilizedCSMs').modal('refresh');
    });

    // close modal function
    $scope.closeModal = function() {
        $('.ui.long.modal.overutilizedCSMs')
        .modal('hide');
    }

    // toggle between graph and table views
    $scope.view = 'Graph';

    $scope.toggleView = function(view) {
        $scope.view = view;
    }

    // link to csm info page
    $scope.relocate = function(item) {
        location.href = '/CSM/' + item.csmName.replace(/ /g, "-");
    }

    // round numbers
    $scope.round = function (value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    // print function
    $scope.print = function() {
        window.print();
    }
});
