// NEW file — bookmark model (mirrors the pattern in userModel.js)
const pool = require('../db/pool');

// Returns all bookmarks joined with the username of the owner.
// The JOIN is what makes the public feed possible — without it we'd only have user_id.
module.exports.list = async () => {
  const query = `
    SELECT e.event_id, e.title, e.description, e.date, e.location, e.event_type, e.max_capacity, e.user_id, u.username,
      COUNT(r.rsvp_id) AS rsvp_count
    FROM events e
    JOIN users u ON e.user_id = u.user_id
    LEFT JOIN rsvps r ON e.event_id = r.event_id
    GROUP BY e.event_id, u.username
    ORDER BY e.date ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Returns all bookmarks for a specific user
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT e.event_id, e.title, e.description, e.date, e.location, e.event_type, e.max_capacity, e.user_id, u.username,
      COUNT(r.rsvp_id) AS rsvp_count
    FROM events e
    JOIN users u ON e.user_id = u.user_id
    LEFT JOIN rsvps r ON e.event_id = r.event_id
    WHERE e.user_id = $1
    GROUP BY e.event_id, u.username
    ORDER BY e.date ASC
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Creates a bookmark owned by the user
module.exports.create = async (user_id, title, date, location, description, event_type, max_capacity) => {
  const query = `
    INSERT INTO events (user_id, title, date, location, description, event_type, max_capacity)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING event_id, user_id, title, date, location, description, event_type, max_capacity
  `;
  const { rows } = await pool.query(query, [user_id, title, date, location, description, event_type, max_capacity]);
  return rows[0];
};

// Finds a single bookmark by id — used by updateBookmark and deleteBookmark before their
// ownership checks. Unlike users, the bookmark URL only contains bookmark_id, not user_id,
// so we have to look up the owner from the database rather than the URL params.
module.exports.find = async (event_id) => {
  const query = 'SELECT event_id, title, date, location, user_id FROM events WHERE event_id = $1';
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};

// Updates a bookmark's title and url
module.exports.update = async (event_id, title, date, location, description, event_type, max_capacity) => {
  const query = `
    UPDATE events
    SET title = $1, date = $2, location = $3, description = $4, event_type = $5, max_capacity = $6
    WHERE event_id = $7
    RETURNING event_id, title, description, date, location, event_type, max_capacity, user_id
  `;
  const { rows } = await pool.query(query, [title, date, location, description, event_type, max_capacity, event_id]);
  return rows[0] || null;
};

// Deletes a bookmark — returns the deleted row or null
module.exports.destroy = async (event_id) => {
  const query = `
    DELETE FROM events
    WHERE event_id = $1
    RETURNING event_id, title, date, location, user_id
  `;
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};
