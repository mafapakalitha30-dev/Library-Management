const router = require('express').Router();
const { pool } = require('../db');
const { wrap, HttpError } = require('../middleware/helpers');

function validateBook(b, requireQuantity) {
  const errors = [];
  if (!b.title?.trim()) errors.push('Title is required');
  if (!b.author?.trim()) errors.push('Author is required');
  if (!b.isbn?.trim()) errors.push('ISBN is required');
  if (requireQuantity && (!Number.isInteger(Number(b.quantity)) || Number(b.quantity) < 0))
    errors.push('Quantity must be a whole number of 0 or more');
  if (errors.length) throw new HttpError(400, errors.join('. '));
}

router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
  res.json(rows);
}));

router.get('/:id', wrap(async (req, res) => {
  const [[book]] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  if (!book) throw new HttpError(404, 'Book not found');
  res.json(book);
}));

// Creating a book also logs its opening stock as a RESTOCK transaction.
router.post('/', wrap(async (req, res) => {
  validateBook(req.body, true);
  const { title, author, genre, isbn, quantity } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)',
      [title.trim(), author.trim(), genre?.trim() || 'General', isbn.trim(), Number(quantity)]
    );
    if (Number(quantity) > 0) {
      await conn.query(
        "INSERT INTO transactions (book_id, type, quantity, notes) VALUES (?, 'RESTOCK', ?, 'Initial stock')",
        [result.insertId, Number(quantity)]
      );
    }
    await conn.commit();
    const [[book]] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(book);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

// Details only. Stock changes go through /transactions so history stays accurate.
router.put('/:id', wrap(async (req, res) => {
  validateBook(req.body, false);
  const { title, author, genre, isbn } = req.body;
  const [result] = await pool.query(
    'UPDATE books SET title=?, author=?, genre=?, isbn=? WHERE id=?',
    [title.trim(), author.trim(), genre?.trim() || 'General', isbn.trim(), req.params.id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Book not found');
  const [[book]] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  res.json(book);
}));

router.delete('/:id', wrap(async (req, res) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new HttpError(404, 'Book not found');
  res.status(204).end();
}));

module.exports = router;
