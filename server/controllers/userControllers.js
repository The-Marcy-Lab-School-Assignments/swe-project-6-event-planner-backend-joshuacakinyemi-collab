const userModel = require('../models/userModel');

// GET /api/users
const listUsers = async (req, res, next) => {
  try {
    const users = await userModel.list();
    res.send(users);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:user_id { password }
const updateUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.user_id);

    // The user_id is in the URL, so we can compare it directly to req.session.userId
    if (!req.session.userId) {
      return res.status(401).send({ message: 'You must be logged in to create an event.' });
    }

    const { password } = req.body;
    const user = await userModel.update(userId, password);
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:user_id
const deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.user_id);

    // The user_id is in the URL, so we can compare it directly to req.session.userId
    if (userId !== req.session.userId) {
      return res.status(403).send({ message: 'You can only delete your own account.' });
    }

    const user = await userModel.destroy(userId);
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUser, deleteUser };
