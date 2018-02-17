app.controller("expensesCtrl", ($scope, $rootScope, $sce) => {
    $scope.trust = $sce.trustAsHtml;
    centsa.expenses.getAll(data => $scope.expenses = data);
    centsa.accounts.getAll(data => $scope.accounts = data);
    centsa.types.getAll(data => $scope.types = data);

    $scope.frequency = {
        type: "basic",
        last: false,
        date: 0,
        day: "MO",
        month: "0"
    };


    const getActiveTotals = () => {
        centsa.expenses.totalActive(false, data => $scope.totalActiveExpenses = data);
        centsa.expenses.totalActive(true, data => $scope.totalAutoExpenses = data);
    }

    getActiveTotals();

    $scope.newExpense = {
        name: "",
        cost: 0.0,
        frequency: "",
        started: new Date().formatDate("yyyy/MM/dd"),
        automatic: false,
        account_id: "",
        type_id: "1"
    };
    let newExpense = Object.assign({}, $scope.newExpense);

    $scope.saveExpense = updating => {
        $scope.newExpense.cost = Math.round($scope.newExpense.cost * 100);
        $scope.newExpense.started = new Date($scope.newExpense.started).getTime();
        if (!$scope.newExpense.account_id) {
            delete $scope.newExpense.account_id;
        }
        centsa.expenses.insert($scope.newExpense, newId => {
            if (updating) {
                $scope.expenses[$scope.expenses.findIndex(e => e.id == $scope.newExpense.id)] = $scope.newExpense;
            } else {
                $scope.newExpense.id = newId;
                $scope.expenses.unshift($scope.newExpense);
            }
            getActiveTotals();
            $scope.newExpense = Object.assign({}, newExpense);
            $('.datepicker[data-ng-model="newExpense.started"]').datepicker("update", new Date().formatDate("yyyy/MM/dd"));
        });
    };

    $scope.getNow = () => Date.now();


    $scope.deleteExpense = function (id) {
        if (centsa.expenses.remove(id)) {
            $scope.expenses = centsa.expenses.getAll(0, 0, "NAME ASC");
            getActiveTotals();
        }
    };

    $scope.getMaxDaysInMonth = () => {
        switch ($scope.frequency.month) {
            case '0':
            case '1':
            case '3':
            case '5':
            case '7':
            case '8':
            case '10':
            case '12':
                return 31;
            case '4':
            case '6':
            case '9':
            case '11':
                return 30;
            case '2':
                return 29;
        }
    };

    $scope.calculateNumberSuperscript = n => {
        n = Math.abs(n);
        if (n > 10 && n < 20) {
            return "th";
        }
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th"
        }
    };

    $scope.getDateMax = (() => {
        let max;
        return (newMax, apply) => apply ? max = newMax : max;
    })();

    $scope.frequencyDisplayText = freq => {
        if (!freq) return;
        let text;
        if (/^\d+$/.test(freq)) {
            text = "Every " + freq + " day" + (freq == 1 ? "" : "s");
        } else {
            text = "On the ";
            if (/^DATE \d+(\/\d+)?$/.test(freq)) {
                var date = freq.split(" ")[1];

                if (date.indexOf("/") != -1) {
                    date = date.split("/");
                    text += date[0] + "<sup>" + $scope.calculateNumberSuperscript(date[0])
                        + "</sup> of the " + date[1] + "<sup>"
                        + $scope.calculateNumberSuperscript(date[1]) + "</sup>";
                } else {
                    text += date + "<sup>" + $scope.calculateNumberSuperscript(date) + "</sup>";
                }
            } else if (/^DAY -?\d+$/.test(freq)) {
                freq = freq.split(" ")[1];
                text += Math.abs(freq) + "<sup>" + $scope.calculateNumberSuperscript(freq) + "</sup>"
                    + (freq < 0 ? " last " : " ") + "day of the month";
            } else if (/^DAY (MO|TU|WE|TH|FR|SA|SU) -?\d+$/.test(freq)) {
                var day = (d => {
                    switch (d) {
                        case "MO": return "Monday";
                        case "TU": return "Tuesday";
                        case "WE": return "Wednesday";
                        case "TH": return "Thursday";
                        case "FR": return "Friday";
                        case "SA": return "Saturday";
                        case "SU": return "Sunday";
                    }
                })(freq.substr(4, 2));
                freq = freq.substr(7);
                text += Math.abs(freq) + "<sup>" + $scope.calculateNumberSuperscript(freq) + "</sup>"
                    + (freq < 0 ? " last " : " ") + day + " of the month";
            } else if (/^[RW]DAY -?\d+$/.test(freq)) {
                const type = freq.charAt(0) == "R" ? "rest" : "working";
                freq = freq.substr(5);
                text += Math.abs(freq) + "<sup>" + $scope.calculateNumberSuperscript(freq) + "</sup>"
                    + (freq < 0 ? " last " : " ") + type + "-day of the month";
            } else { text = "ERROR: " + freq; }
        }
        return text;
    };


    $('.datepicker').datepicker({
        format: "yyyy/mm/dd",
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
    });
    $('.datepicker[data-ng-model="newExpense.started"]').datepicker("update", new Date().formatDate("yyyy/MM/dd"));

    $('.dropdown-menu').click(e => e.stopPropagation());

    $('#frequencySelect').on('hide.bs.dropdown', () => $scope.$apply(function () {
        try {
            switch ($scope.frequency.type) {
                case "basic":
                    $scope.newExpense.frequency = $scope.frequency.date;
                    break;
                case "date":
                    $scope.newExpense.frequency = "DATE " + $scope.frequency.date
                        + (parseInt($scope.frequency.month) ? "/" + $scope.frequency.month : "");
                    break;
                case "day":
                    $scope.newExpense.frequency = "DAY " + $scope.frequency.day + " ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
                case "monthday":
                    $scope.newExpense.frequency = "DAY ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
                case "workday":
                    $scope.newExpense.frequency = "WDAY ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
                case "restday":
                    $scope.newExpense.frequency = "RDAY ";
                    if ($scope.frequency.last) {
                        $scope.newExpense.frequency += "-";
                    } else if ($scope.frequency.date == $scope.getDateMax()) {
                        throw "Invalid date";
                    }
                    $scope.newExpense.frequency += $scope.frequency.date;
                    break;
            }
        } catch (e) { $scope.newExpense.frequency = ""; }
    }));

});