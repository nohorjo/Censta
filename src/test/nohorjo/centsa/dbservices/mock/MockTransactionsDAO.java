package nohorjo.centsa.dbservices.mock;

import static org.junit.Assert.assertEquals;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.math.RandomUtils;

import nohorjo.centsa.dbservices.TransactionsDAO;
import nohorjo.centsa.vo.Transaction;
import nohorjo.centsa.vo.TransactionFilter;
import nohorjo.centsa.vo.VO;

public class MockTransactionsDAO extends TransactionsDAO {

	public static final Transaction TRANSACTION;
	public static final int AMOUNT = RandomUtils.nextInt(), PAGE_COUNT = RandomUtils.nextInt(),
			PRECISION = RandomUtils.nextInt(), SUM = RandomUtils.nextInt();
	public static final String COMMENT = RandomStringUtils.randomAlphabetic(10);
	public static final long ACCOUNT_ID = RandomUtils.nextLong(), TYPE_ID = RandomUtils.nextLong(),
			DATE = RandomUtils.nextLong(), EXPENSE_ID = RandomUtils.nextLong();
	public static final List<String> COMMENTS = Arrays.asList(RandomStringUtils.random(10),
			RandomStringUtils.random(10), RandomStringUtils.random(10));
	public static final List<Map<String, Long>> SUMS;
	public static final TransactionFilter FILTER = new TransactionFilter();

	static {
		TRANSACTION = new Transaction();
		TRANSACTION.setId(MockDAO.ID);
		TRANSACTION.setAmount(AMOUNT);
		TRANSACTION.setComment(COMMENT);
		TRANSACTION.setAccount_id(ACCOUNT_ID);
		TRANSACTION.setType_id(TYPE_ID);
		TRANSACTION.setDate(DATE);
		TRANSACTION.setExpense_id(EXPENSE_ID);

		SUMS = new ArrayList<>();

		Map<String, Long> sum1 = new HashMap<>();
		sum1.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());
		sum1.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());
		sum1.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());

		Map<String, Long> sum2 = new HashMap<>();
		sum2.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());
		sum2.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());
		sum2.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());

		Map<String, Long> sum3 = new HashMap<>();
		sum3.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());
		sum3.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());
		sum3.put(RandomStringUtils.randomAlphabetic(10), RandomUtils.nextLong());

		SUMS.add(sum1);
		SUMS.add(sum2);
		SUMS.add(sum3);
	}

	private MockDAO<Transaction> mock;
	private DAOOption option;

	public MockTransactionsDAO(DAOOption option) {
		this.option = option;
		mock = new MockDAO<>(option, TRANSACTION);
	}

	@Override
	public Transaction get(long id) throws SQLException {
		return mock.handleGet(id);
	}

	@Override
	public List<Transaction> getAll(int page, int pageSize, String orderBy, TransactionFilter filter)
			throws SQLException {
		assertEquals(FILTER, filter);
		return mock.handleGetAll(page, pageSize, orderBy);
	}

	@Override
	public void delete(long id) throws SQLException {
		mock.handleDelete();
	}

	@Override
	public long insert(VO _vo) throws SQLException {
		return mock.handleInsert((Transaction) _vo);
	}

	@Override
	public int countPages(int pageSize, TransactionFilter filter) throws SQLException {
		assertEquals(MockDAO.PAGE_SIZE, pageSize);
		assertEquals(FILTER, filter);
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return PAGE_COUNT;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public List<String> getUniqueComments() throws SQLException {
		switch (option) {
		case FINE:
			return COMMENTS;
		case ERROR:
			throw new SQLException();
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public List<Map<String, Long>> getCumulativeSums(int precision) throws SQLException {
		assertEquals(PRECISION, precision);
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return SUMS;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}

	@Override
	public int sumAll() throws SQLException {
		switch (option) {
		case ERROR:
			throw new SQLException();
		case FINE:
			return SUM;
		case NONE:
		}
		throw new IllegalStateException("Invalid option: " + option);
	}
}
