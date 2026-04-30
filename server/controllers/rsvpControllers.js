// NEW file — bookmark controllers (mirrors the pattern in userControllers.js)
const rsvpModel = require('../models/rsvpModel');

// GET /api/bookmarks — all bookmarks with owner username (public)
const listRsvps = async (req, res, next) => {
  try {
    const rsvps = await rsvpModel.list();
    res.send(rsvps);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/bookmarks — bookmarks for a specific user (public)
const listUserRsvps = async (req, res, next) => {
  try {
    const userId = Number(req.params.user_id);
    const rsvps = await rsvpModel.listByUser(userId);
    res.send(rsvps);
  } catch (err) {
    next(err);
  }
};

// POST /api/bookmarks { title, url }
const createRsvp = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ message: 'You must be logged in to RSVP.' });
    }
    const event_id = Number(req.params.event_id);
    const rsvp = await rsvpModel.create(req.session.userId, event_id);
    res.status(201).send(rsvp);
  } catch (err) {
    next(err);
  }
};

const deleteRsvp = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ message: 'You must be logged in.' });
    }
    const event_id = Number(req.params.event_id);

    const existing = await rsvpModel.findByEventAndUser(event_id, req.session.userId);
    if (!existing) return res.status(404).send({ message: 'RSVP not found' });

    if (existing.user_id !== req.session.userId) {
      return res.status(403).send({ message: 'You can only delete your own RSVPs.' });
    }

    const rsvp = await rsvpModel.destroy(existing.rsvp_id);
    res.send(rsvp);
  } catch (err) {
    next(err);
  }
};

module.exports = { listRsvps, listUserRsvps, createRsvp, deleteRsvp };
