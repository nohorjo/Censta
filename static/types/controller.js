app.controller('typesCtrl', function ($scope, centsa) {
    $scope.types = [];
    centsa.types.getAll().then(resp => {
        $scope.types = resp.data;
        $scope.drawPie();
    });

    $scope.newType = {
        name: ''
    };
    var newType = {...$scope.newType};

    $scope.saveType = () => centsa.types.insert($scope.newType).then(resp => {
        $scope.newType.id = resp.data;
        $scope.newType.sum = 0;
        $scope.types.unshift($scope.newType);
        $scope.newType = {...newType};
        $scope.drawPie();
    });

    $scope.deleteType = async id => {
        const result = await swal({
            title: `Are you sure you want to delete '${$scope.types.find(t => t.id == id).name}'?`,
            text: 'Once deleted, you will not be able to recover this type!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if(result.value) {
            centsa.types.remove(id).then(() => {
                $scope.types.splice($scope.types.findIndex(t => t.id == id), 1);
                $scope.drawPie();
            });
        }
    };

    $scope.drawPie = () => {
        console.log('draw pie');
        const chartOpts = {
            type: 'pie',
            theme: 'light',
            dataProvider: $scope.types
                .filter(t => t.sum > 0)
                .map(t => ({
                    name: t.name,
                    sum: t.sum / 100
                })),
            valueField: 'sum',
            titleField: 'name',
            balloon: {
                fixedPosition: true
            },
            legend: new AmCharts.AmLegend(),
        };
        if ($(window).width() <= 500) {
            chartOpts.labelsEnabled = false;
        }
        AmCharts.makeChart('types-chart', chartOpts);
    };

});
