const app = angular.module("app", ["ngRoute"]);

app.controller("mainCtrl", function ($scope, $rootScope, $location) {
	$rootScope.formatDate = date => {
		if (date.constructor == String) {
			date = date.substr(0, 19);
		}
		return new Date(date).formatDate("yyyy/MM/dd");
	};

	$rootScope.sort = (() => {
		let lastProp;
		let asc = true;
		return (prop, arr) => {
			if (lastProp != prop) {
				lastProp = prop;
				asc = false;
			}
			asc = !asc
			arr.sort(function (a, b) {
				p1 = a[prop];
				p2 = b[prop];
				var comp;
				if (p1.constructor == String) {
					comp = p1.localeCompare(p2);
				} else {
					comp = p1 - p2;
				}
				return comp * (asc ? 1 : -1);
			});
		};
	})();

	/**
	 * Used to filter transactions. Available in the rootscope so that other
	 * pages can set it if needed
	 */
	$rootScope.resetFilter = () => $rootScope.filter = {
		account_id: '0',
		type_id: '0',
		expense_id: '0',
		regex: false
	};
	$rootScope.resetFilter();

	$rootScope.setFilter = f => {
		$rootScope.filter = f;
		$location.path("transactions");
	};

	/**
	 * Rounds a number
	 */
	$rootScope.roundTo = (x, dp) => {
		var mult = Math.pow(10, dp);
		return Math.round(x * mult) / mult;
	};

	$scope.isActive = path => $location.path() == path;

});

app.filter('range', function () {
	return function (input, total) {
		total = parseInt(total);
		for (let i = 0; i < total; i++)
			input.push(i);
		return input;
	};
});

app.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			const model = $parse(attrs.fileModel);
			const modelSetter = model.assign;

			element.bind('change', function () {
				scope.$apply(function () {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]);