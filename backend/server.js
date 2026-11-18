require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { errorHandler } = require('./middleware/helpers');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/users', require('./routes/users'));
app.use('/transactions', require('./routes/transactions'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('Database setup failed:', err.message); process.exit(1); });
