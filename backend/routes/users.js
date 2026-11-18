const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { wrap, HttpError } = require('../middleware/helpers');

const ROLES = ['admin', 'librarian', 'member'];
const FIELDS = 'id, name, membership_id, role, created_at'; // never expose password_hash

function validateUser(u, passwordRequired) {
  const errors = [];
  if (!u.name?.trim()) errors.push('Name is required');
  if (!u.membership_id?.trim()) errors.push('Membership ID is required');
  if (!ROLES.includes(u.role)) errors.push('Role must be admin, librarian or member');
  if (passwordRequired && (!u.password || u.password.length < 6)) errors.push('Password must be at least 6 characters');
  if (!passwordRequired && u.password && u.password.length < 6) errors.push('Password must be at least 6 characters');
  if (errors.length) throw new HttpError(400, errors.join('. '));
}

router.get('/', wrap(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM users ORDER BY name`);
  res.json(rows);
}));

router.get('/:id', wrap(async (req, res) => {
  const [[user]] = await pool.query(`SELECT ${FIELDS} FROM users WHERE id = ?`, [req.params.id]);
  if (!user) throw new HttpError(404, 'User not found');
  res.json(user);
}));

router.post('/', wrap(async (req, res) => {
  validateUser(req.body, true);
  const { name, membership_id, role, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
    [name.trim(), membership_id.trim(), role, hash]
  );
  const [[user]] = await pool.query(`SELECT ${FIELDS} FROM users WHERE id = ?`, [result.insertId]);
  res.status(201).json(user);
}));

router.put('/:id', wrap(async (req, res) => {
  validateUser(req.body, false);
  const { name, membership_id, role, password } = req.body;
  const params = [name.trim(), membership_id.trim(), role];
  let sql = 'UPDATE users SET name=?, membership_id=?, role=?';
  if (password) { sql += ', password_hash=?'; params.push(await bcrypt.hash(password, 10)); }
  sql += ' WHERE id=?';
  params.push(req.params.id);
  const [result] = await pool.query(sql, params);
  if (!result.affectedRows) throw new HttpError(404, 'User not found');
  const [[user]] = await pool.query(`SELECT ${FIELDS} FROM users WHERE id = ?`, [req.params.id]);
  res.json(user);
}));

router.delete('/:id', wrap(async (req, res) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) throw new HttpError(404, 'User not found');
  res.status(204).end();
}));

module.exports = router;
