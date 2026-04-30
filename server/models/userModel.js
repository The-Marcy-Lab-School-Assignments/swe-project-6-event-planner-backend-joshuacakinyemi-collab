const bcrypt = require('bcrypt');
const pool = require('../db/pool');

const SALT_ROUNDS = 7;

// Returns all users — never exposes password
module.exports.list = async () => {
  const { rows } = await pool.query('SELECT user_id, username FROM users ORDER BY user_id');
  return rows;
};

// Returns { user_id, username } or null — used by /api/auth/me
module.exports.find = async (user_id) => {
  const query = 'SELECT user_id, username FROM users WHERE user_id = $1';
  const { rows } = await pool.query(query, [user_id]);
  return rows[0] || null;
};

// Returns { user_id, username } or null — used to check if username is taken
module.exports.findByUsername = async (username) => {
  const query = 'SELECT user_id, username FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  return rows[0] || null;
};

// Stores the user and returns user_id and username — never exposes password
module.exports.create = async (username, password) => {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const query = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username';
  const { rows } = await pool.query(query, [username, password_hash]);
  return rows[0];
};

// Finds the user by username and validates the password
// Returns { user_id, username } if credentials match — never exposes password
// Returns null if not found or password doesn't match
module.exports.validatePassword = async (username, password) => {
  const query = 'SELECT * FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  const user = rows[0];
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;
  return { user_id: user.user_id, username: user.username };
};

// Updates the user's password and returns user_id and username — never exposes password
// Returns null if not found
module.exports.update = async (user_id, password) => {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const query = 'UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id, username';
  const { rows } = await pool.query(query, [password_hash, user_id]);
  return rows[0] || null;
};

// Deletes the user and returns user_id and username
// Returns null if not found
module.exports.destroy = async (user_id) => {
  const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id, username';
  const { rows } = await pool.query(query, [user_id]);
  return rows[0] || null;
};
