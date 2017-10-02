package nohorjo.centsa.dbservices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;
import java.util.function.Function;

import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.VO;

public class TransactionsDAO extends AbstractDAO {

	private static final String[] COLUMNS = { "AMOUNT", "COMMENT", "ACCOUNT_ID", "TYPE_ID", "EXPENSE_ID", "DATE" };
	private static final String TABLE_NAME = "TRANSACTIONS";

	static {
		try {
			new TransactionsDAO().createTable();
		} catch (SQLException e) {
			throw new Error(e);
		}
	}

	@Override
	public void createTable() throws SQLException {
		createTable("Transactions.CreateTable");
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		Transaction t = (Transaction) _vo;

		return insert(TABLE_NAME, COLUMNS, new Object[] { t.getId(), t.getAmount(), t.getComment(), t.getAccountId(),
				t.getTypeId(), t.getExpenseId(), t.getDate() });
	}

	@Override
	public List<Transaction> getAll(int page, int pageSize, String order) throws SQLException {
		Function<ResultSet, List<Transaction>> processor = new Function<ResultSet, List<Transaction>>() {

			@Override
			public List<Transaction> apply(ResultSet rs) {
				List<Transaction> ts = new LinkedList<>();
				try {
					while (rs.next()) {
						Transaction t = new Transaction();
						t.setId(rs.getLong("ID"));
						t.setAmount(rs.getInt("AMOUNT"));
						t.setComment(rs.getString("COMMENT"));
						t.setAccountId(rs.getLong("ACCOUNT_ID"));
						t.setTypeId(rs.getLong("TYPE_ID"));
						t.setDate(rs.getTimestamp("DATE"));
						t.setExpenseId(rs.getLong("EXPENSE_ID"));
						ts.add(t);
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new Error(e);
				}
				return ts;
			}
		};
		return getAll(TABLE_NAME, COLUMNS, order, page, pageSize, processor);
	}

	@Override
	public Transaction get(long id) throws SQLException {
		Function<ResultSet, Transaction> processor = new Function<ResultSet, Transaction>() {

			@Override
			public Transaction apply(ResultSet rs) {
				try {
					if (rs.next()) {
						Transaction t = new Transaction();
						t.setId(id);
						t.setAmount(rs.getInt("AMOUNT"));
						t.setComment(rs.getString("COMMENT"));
						t.setAccountId(rs.getLong("ACCOUNT_ID"));
						t.setTypeId(rs.getLong("TYPE_ID"));
						t.setDate(rs.getTimestamp("DATE"));
						t.setExpenseId(rs.getLong("EXPENSE_ID"));
						return t;
					}
				} catch (SQLException e) {
					e.printStackTrace();
					throw new Error(e);
				}
				return null;
			}
		};

		return get(TABLE_NAME, COLUMNS, id, processor);
	}

	@Override
	public void delete(long id) throws SQLException {
		delete(TABLE_NAME, id);
	}

}
