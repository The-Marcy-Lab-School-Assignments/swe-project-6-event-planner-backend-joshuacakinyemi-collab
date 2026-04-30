const userModel = require('../models/userModel');

// POST /api/auth/register { username, password }
const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ error: 'Username and password are required.' });
    }

    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).send({ message: 'Username already taken' });
    }

    const user = await userModel.create(username, password);

    // Start a session — the user is now logged in
    req.session.userId = user.user_id;

    res.status(201).send(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login { username, password }
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // validatePassword handles both the lookup and bcrypt.compare internally
    const user = await userModel.validatePassword(username, password);

    // Same message for wrong username and wrong password — don't leak which one failed
    if (!user) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    // Credentials are valid — start a session
    req.session.userId = user.user_id;

    res.send(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const { userId } = req.session;

    // No session — user is not logged in
    if (!userId) return res.status(401).send(null);

    // Session exists — look up and return the user
    const user = await userModel.find(userId);
    if (!user) return res.status(401).send(null);

    res.send(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/logout
const logout = (req, res) => {
  req.session = null; // tells cookie-session to delete the cookie
  res.send({ message: 'Logged out' });
};

module.exports = { register, login, getMe, logout };
