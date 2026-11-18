// Express 4 does not catch rejected promises, so wrap async handlers.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Turn MySQL duplicate-key errors into friendly 409 responses.
function errorHandler(err, req, res, next) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That value already exists (duplicate ISBN or membership ID).' });
  }
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong on the server.' });
}

module.exports = { wrap, HttpError, errorHandler };
