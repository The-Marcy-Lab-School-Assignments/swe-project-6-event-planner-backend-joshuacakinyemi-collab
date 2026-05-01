// NEW file — bookmark controllers (mirrors the pattern in userControllers.js)
const eventModel = require('../models/eventModel');

// GET /api/bookmarks — all bookmarks with owner username (public)
const listEvents = async (req, res, next) => {
  try {
    const events = await eventModel.list();
    res.send(events);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/bookmarks — bookmarks for a specific user (public)
const listUserEvents = async (req, res, next) => {
  try {
    const userId = Number(req.params.user_id);
    const events = await eventModel.listByUser(userId);
    res.send(events);
  } catch (err) {
    next(err);
  }
};

// POST /api/bookmarks { title, url }
const createEvent = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send({ message: 'You must be logged in to create an event.' });
    }
    const { title, date, location, description, event_type, max_capacity } = req.body;
    const event = await eventModel.create(req.session.userId, title, date, location, description, event_type, max_capacity);
    res.status(201).send(event);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookmarks/:bookmark_id { title, url }
// Ownership check here is different from updateUser: the URL only has bookmark_id, not user_id,
// so we can't compare URL params to the session. We fetch the bookmark first to get its owner.
const updateEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);

    const existing = await eventModel.find(eventId);
    if (!existing) return res.status(404).send({ message: 'Event not found' });

    // Ownership check — the bookmark's user_id must match the session userId
    if (!req.session.userId) {
      return res.status(401).send({ message: 'You must be logged in.' });
    }
    if (existing.user_id !== req.session.userId) {
      return res.status(403).send({ message: 'You can only update your own events.' });
    }

    const { title, date, location, description, event_type, max_capacity } = req.body;
    const event = await eventModel.update(eventId, title, date, location, description, event_type, max_capacity);
    res.send(event);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookmarks/:bookmark_id — same find-then-check pattern as updateBookmark
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);

    const existing = await eventModel.find(eventId);
    if (!existing) return res.status(404).send({ message: 'Event not found' });

    if (!req.session.userId) {
      return res.status(401).send({ message: 'You must be logged in.' });
    }
    if (existing.user_id !== req.session.userId) {
      return res.status(403).send({ message: 'You can only update your own events.' });
    }

    const event = await eventModel.destroy(eventId);
    res.send(event);
  } catch (err) {
    next(err);
  }
};

module.exports = { listEvents, listUserEvents, createEvent, updateEvent, deleteEvent };
