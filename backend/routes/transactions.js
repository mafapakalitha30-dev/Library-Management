const router = require('express').Router();
const { pool } = require('../db');
const { wrap, HttpError } = require('../middleware/helpers');

const TYPES = ['RESTOCK', 'BORROW', 'RETURN'];
// BORROW deducts stock; RESTOCK and RETURN add it.
const delta = (type, qty) => (type === 'BORROW' ? -qty : qty);

const SELECT = `
  SELECT t.*, b.title AS book_title, u.name AS user_name, u.membership_id
  FROM transactions t
  JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id`;

router.get('/', wrap(async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.book_id) { where.push('t.book_id = ?'); params.push(req.query.book_id); }
  if (req.query.user_id) { where.push('t.user_id = ?'); params.push(req.query.user_id); }
  const sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY t.created_at DESC, t.id DESC`;
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

router.get('/:id', wrap(async (req, res) => {
  const [[row]] = await pool.query(`${SELECT} WHERE t.id = ?`, [req.params.id]);
  if (!row) throw new HttpError(404, 'Transaction not found');
  res.json(row);
}));

// Record a transaction and update stock atomically.
router.post('/', wrap(async (req, res) => {
  const { book_id, user_id, type, notes, due_date } = req.body;
  const quantity = Number(req.body.quantity);
  if (!book_id) throw new HttpError(400, 'Choose a book');
  if (!TYPES.includes(type)) throw new HttpError(400, 'Type must be RESTOCK, BORROW or RETURN');
  if (!Number.isInteger(quantity) || quantity < 1) throw new HttpError(400, 'Quantity must be a whole number of 1 or more');
  if (type !== 'RESTOCK' && !user_id) throw new HttpError(400, 'Choose the member for a borrow or return');
  if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) throw new HttpError(400, 'Due date must be a valid date');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[book]] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (!book) throw new HttpError(404, 'Book not found');
    const newQty = book.quantity + delta(type, quantity);
    if (newQty < 0) throw new HttpError(400, `Only ${book.quantity} cop${book.quantity === 1 ? 'y' : 'ies'} in stock`);
    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQty, book_id]);
    const [result] = await conn.query(
    'INSERT INTO transactions (book_id, user_id, type, quantity, notes, due_date) VALUES (?,?,?,?,?,?)',
    [book_id, user_id || null, type, quantity, notes?.trim() || null, type === 'BORROW' ? due_date || null : null]
    );
    await conn.commit();
    const [[row]] = await pool.query(`${SELECT} WHERE t.id = ?`, [result.insertId]);
    res.status(201).json(row);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

// Only the note can be edited; changing quantities would rewrite history.
router.put('/:id', wrap(async (req, res) => {
  const [result] = await pool.query('UPDATE transactions SET notes = ? WHERE id = ?', [req.body.notes?.trim() || null, req.params.id]);
  if (!result.affectedRows) throw new HttpError(404, 'Transaction not found');
  const [[row]] = await pool.query(`${SELECT} WHERE t.id = ?`, [req.params.id]);
  res.json(row);
}));

// Deleting a transaction reverses its effect on stock (if that is still possible).
router.delete('/:id', wrap(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[t]] = await conn.query('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!t) throw new HttpError(404, 'Transaction not found');
    const [[book]] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [t.book_id]);
    const newQty = book.quantity - delta(t.type, t.quantity);
    if (newQty < 0) throw new HttpError(400, 'Cannot undo this: stock has already been used since');
    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQty, t.book_id]);
    await conn.query('DELETE FROM transactions WHERE id = ?', [t.id]);
    await conn.commit();
    res.status(204).end();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

module.exports = router;
