// NEW file — bookmark model (mirrors the pattern in userModel.js)
const pool = require('../db/pool');

// Returns all bookmarks joined with the username of the owner.
// The JOIN is what makes the public feed possible — without it we'd only have user_id.
module.exports.list = async () => {
  const query = `
    SELECT rsvps.rsvp_id, events.event_id, events.title, rsvps.user_id, users.username
    FROM rsvps
    JOIN events ON rsvps.event_id = events.event_id
    JOIN users ON rsvps.user_id = users.user_id
    ORDER BY rsvps.rsvp_id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Returns all bookmarks for a specific user
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT r.rsvp_id, r.user_id, r.event_id, e.title, e.date, e.location, e.event_type, u.username
    FROM rsvps r
    JOIN events e ON r.event_id = e.event_id
    JOIN users u ON r.user_id = u.user_id
    WHERE r.user_id = $1
    ORDER BY e.date ASC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

module.exports.findByEventAndUser = async (event_id, user_id) => {
  const query = `
    SELECT * FROM rsvps
    WHERE event_id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(query, [event_id, user_id]);
  return rows[0] || null;
};

// Creates a bookmark owned by the user
module.exports.create = async (user_id, event_id) => {
  const query = `
    INSERT INTO rsvps (user_id, event_id)
    VALUES ($1, $2)
    RETURNING rsvp_id, event_id, user_id
  `;
  const { rows } = await pool.query(query, [user_id, event_id]);
  return rows[0];
};

// Finds a single bookmark by id — used by updateBookmark and deleteBookmark before their
// ownership checks. Unlike users, the bookmark URL only contains bookmark_id, not user_id,
// so we have to look up the owner from the database rather than the URL params.
module.exports.find = async (rsvp_id) => {
  const query = 'SELECT rsvp_id, event_id, user_id FROM rsvps WHERE rsvp_id = $1';
  const { rows } = await pool.query(query, [rsvp_id]);
  return rows[0] || null;
};

// Updates a bookmark's title and url
module.exports.update = async (event_id, rsvp_id) => {
  const query = `
    UPDATE rsvps
    SET event_id = $1
    WHERE rsvp_id = $2
    RETURNING rsvp_id, event_id
  `;
  const { rows } = await pool.query(query, [rsvp_id, event_id]);
  return rows[0] || null;
};

// Deletes a bookmark — returns the deleted row or null
module.exports.destroy = async (rsvp_id) => {
  const query = `
    DELETE FROM rsvps
    WHERE rsvp_id = $1
    RETURNING rsvp_id, event_id, user_id
  `;
  const { rows } = await pool.query(query, [rsvp_id]);
  return rows[0] || null;
};
