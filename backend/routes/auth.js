const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { wrap, HttpError } = require('../middleware/helpers');

router.post('/login', wrap(async (req, res) => {
  const { membership_id, password } = req.body;
  if (!membership_id || !password) throw new HttpError(400, 'Enter your membership ID and password');
  const [[user]] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membership_id.trim()]);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new HttpError(401, 'Membership ID or password is incorrect');
  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
}));

module.exports = router;
