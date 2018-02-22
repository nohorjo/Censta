app.controller("typesCtrl", function ($scope, centsa) {
	$scope.types = [];
	centsa.types.getAll(data => {
		$scope.types = data;
		drawPie();
	});

	$scope.newType = {
		name: ""
	};
	var newType = Object.assign({}, $scope.newType);

	$scope.saveType = () => centsa.types.insert($scope.newType, id => {
		$scope.newType.id = id;
		$scope.newType.sum = 0;
		$scope.types.unshift($scope.newType);
		$scope.newType = Object.assign({}, newType);
		drawPie();
	});;

	$scope.deleteType = id => centsa.types.remove(id, () => {
		$scope.types.splice($scope.types.findIndex(t => t.id == id), 1);
		drawPie();
	});

	const drawPie = () => {
		AmCharts.makeChart("types-chart", {
			type: "pie",
			theme: "light",
			dataProvider: $scope.types.map(t => ({
				name: t.name,
				sum: t.sum / 100
			})),
			valueField: "sum",
			titleField: "name",
			balloon: {
				fixedPosition: true
			}
		});
	}

});