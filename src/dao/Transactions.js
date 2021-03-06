const { pool } = require('./Connection');

const NO_FILTER = {
    comments: [{comment: '%%'}],
    fromDate: new Date(-8.64e15),
    toDate: new Date(8.64e15),
    fromAmount: Number.MIN_SAFE_INTEGER,
    toAmount: Number.MAX_SAFE_INTEGER
};

const Transactions = {};

Transactions.insertAutoTransactions = (trans, cb) => {
    if (trans.length > 0) {
        pool.query(
            `INSERT IGNORE INTO transactions
            (user_id,amount,comment,account_id,type_id,expense_id,date)
            VALUES ?;`,
            [trans],
            cb
        );
    }
};

Transactions.getAll = (
    userId,
    filter,
    page,
    pageSize,
    sort,
    cb
) => {
    filter = {
        ...NO_FILTER,
        ...filter
    };
    if (!sort || !/^(\s*[a-z]* (A|DE)SC.? ?)+$/.test(sort)) {
        sort = '1 ASC';
    }

    pool.query(
        `SELECT id,amount,comment,account_id,type_id,date,expense_id FROM transactions WHERE user_id=?
        AND ${filterToClause(filter)}
        ORDER BY ${sort.replace(/,$/g, '')}
        LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)};`,
        [
            userId,
            ...filter.comments.map(c => c.comment),
            filter.fromDate,
            filter.toDate,
            filter.fromAmount,
            filter.toAmount
        ],
        cb
    );
};

Transactions.checkEntityOwnership = (transaction, cb) => {
    pool.query(
        `SELECT COUNT(*) AS count FROM users u 
        JOIN accounts a ON u.id=a.user_id 
        JOIN expenses e ON u.id=e.user_id 
        JOIN types t ON u.id=t.user_id 
        WHERE u.id!=? AND (a.id=? OR e.id=? OR t.id = ?);`,
        [
            transaction.user_id,
            transaction.account_id,
            transaction.expense_id || -1,
            transaction.type_id
        ],
        (err, results) => {
            cb(err, err || !results[0].count);
        }
    );
};

Transactions.insert = (transaction, cb) => {
    pool.query(
        `${transaction.id ? 'REPLACE' : 'INSERT'} INTO transactions SET ?;`,
        transaction,
        (err, results) => {
            cb(err, err || results.insertId);
        }
    );
};

Transactions.checkBatchEntityOwnership = (
    userId,
    accountIds,
    expenseIds,
    typeIds,
    cb
) => {
    pool.query(
        `SELECT COUNT(*) AS count FROM users u 
        JOIN accounts a ON u.id=a.user_id 
        JOIN expenses e ON u.id=e.user_id 
        JOIN types t ON u.id=t.user_id 
        WHERE u.id!=? AND (a.id IN (?) OR e.id IN (?) OR t.id in (?));`,
        [
            userId,
            accountIds,
            expenseIds,
            typeIds
        ],
        (err, results) => {
            cb(err, err || !results[0].count);
        }
    );
};

Transactions.insertBatch = (transactions, cb) => {
    pool.query(
        `INSERT INTO transactions
        (user_id,amount,comment,account_id,type_id,expense_id,date)
        VALUES ?;`,
        [transactions],
        cb
    );
};

Transactions.deleteTransaction = (id, userId, cb) => {
    pool.query(
        'DELETE FROM transactions WHERE id=? AND user_id=?;',
        [id, userId],
        cb
    );
};

Transactions.getAmounts = (userId, cb) => {
    pool.query(
        'SELECT date, -amount AS amount FROM transactions WHERE user_id=? ORDER BY date ASC;',
        [userId],
        cb
    );
};

Transactions.getSummary = (userId, filter, cb) => {
    filter = {
        ...NO_FILTER,
        ...filter
    };
    pool.query(
        `SELECT COUNT(*) AS count, SUM(amount) AS sum, MIN(amount) as min, MAX(amount) AS max FROM transactions WHERE user_id=?
        AND ${filterToClause(filter)};`,
        [
            userId,
            ...filter.comments.map(c => c.comment),
            filter.fromDate,
            filter.toDate,
            filter.fromAmount,
            filter.toAmount
        ],
        cb
    );
};

Transactions.getUniqueComments = (userId, cb) => {
    pool.query(
        'SELECT DISTINCT comment FROM transactions WHERE user_id=? ORDER BY comment;',
        [userId],
        cb
    );
};

Transactions.deleteTransfers = (userId, accounts, likeComment, cb) => {
    pool.query(
        'DELETE FROM transactions WHERE user_id=? AND comment LIKE ? AND account_id IN (?);',
        [
            userId,
            likeComment,
            accounts,
        ],
        cb,
    );
};

const filterToClause = filter => `
    (${filter.comments.map(c => `comment ${c.regex ? 'R' : ''}LIKE ?`).join(' OR ') || '1=1'})
    AND date>=? AND date<=?
    AND amount>=? AND amount<=?
    ${filter.account_id ? ` AND account_id=${filter.account_id}` : ''} 
    ${filter.type_id ? ` AND type_id=${filter.type_id}` : ''} 
    ${filter.expense_id ? ` AND expense_id=${filter.expense_id}` : ''}
`;


module.exports = Transactions;
