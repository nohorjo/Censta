app.service('centsa', function ($http) {
    class genericApi {
        constructor(path) { this.apiUrl = `/api/${path}`; }
        getAll(success, error) { $http.get(this.apiUrl).then(resp => success(resp.data), error); }
        insert(item, success, error) { $http.post(this.apiUrl, item).then(resp => success(resp.data), error); }
        //FIXME:
        remove(id, success, error) { $http.delete(`${this.apiUrl}/${id}`, success, error); }
    }
    class expensesApi extends genericApi {
        constructor() { super('expenses'); }
        getAll(activeOnly, success, error) { $http.get(this.apiUrl, { params: { activeOnly: activeOnly } }).then(resp => success(resp.data), error); }
        totalActive(incAuto, success, error) { $http.get(`${this.apiUrl}/total`, { params: { auto: incAuto } }).then(resp => success(resp.data), error); }
    }
    class transactionsApi extends genericApi {
        constructor() { super('transactions'); }
        getAll(options, success, error) { $http.get(this.apiUrl, { params: options }).then(resp => success(resp.data), error); }
        remove(id, success, error) { $http.delete(`${this.apiUrl}/${id}`, success, error); }
        getCumulativeSums(success, error) { $http.get(`${this.apiUrl}/cumulativeSums`).then(resp => success(resp.data), error); }
        countPages(options, success, error) { $http.get(`${this.apiUrl}/pages`, { params: options }).then(resp => success(resp.data), error); }
        getSummary(filter, success, error) { $http.get(`${this.apiUrl}/summary`, { params: { filter: filter } }).then(resp => success(resp.data), error); }
        getUniqueComments(success, error) { $http.get(`${this.apiUrl}/comments`).then(resp => success(resp.data), error); }
    }

    this.accounts = new genericApi('accounts');
    this.types = new genericApi('types');
    this.transactions = new transactionsApi();
    this.expenses = new expensesApi();
    this.settings = (() => {
        const apiUrl = '/api/settings';
        let _settings;
        return {
            get(key, success, error) {
                if (!_settings) {
                    $http.get(apiUrl).then(resp => {
                        _settings = resp.data;
                        success(_settings[key]);
                    }, error);
                } else {
                    success(_settings[key]);
                }
            },
            set(key, value, success, error) {
                _settings[key] = value;
                $http.post(apiUrl, { key: key, value: value }).then(success, error);
            }
        };
    })();
    this.general = (() => {
        const apiUrl = '/api/general';
        return {
            budget(isStrictMode, success, error) { $http.get(`${apiUrl}/budget`, { params: { strict: isStrictMode } }).then(resp => success(resp.data), error); },
            rules(success, error) { $http.get(`${apiUrl}/rules`).then(resp => success(resp.data), error); },
            importFile(rule, file, success, error) {
                const fd = new FormData();
                fd.append('csv', file);
                $http.post(`${apiUrl}/import`, fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined },
                    params: { rule: rule }
                }).then(resp => success(resp.data), error);
            },
            importProgress(id, success, error) { $http.get(`${apiUrl}/import`, { params: { id: id } }).then(resp => success(resp.data), error); }
        };
    })();

});