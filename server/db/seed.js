// db/seed.js
const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 7;

const seed = async () => {
  // CHANGED: must drop bookmarks before users — bookmarks has a FK referencing users
  await pool.query('DROP TABLE IF EXISTS rsvps CASCADE'); // NEW
  await pool.query('DROP TABLE IF EXISTS events CASCADE'); // NEW
  await pool.query('DROP TABLE IF EXISTS users CASCADE');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  // TODO: Add a bookmarks table — user_id is a FK so deleting a user cascades to their bookmarks
  await pool.query(`
    CREATE TABLE events (
      event_id  SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      description   TEXT,
      date    TEXT NOT NULL,
      location    TEXT NOT NULL,
      event_type    TEXT NOT NULL,
      max_capacity    INTEGER NOT NULL,
      user_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE rsvps (
      rsvp_id  SERIAL PRIMARY KEY,
      user_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      event_id      INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
                    UNIQUE (user_id, event_id)
    )
  `);

  // 1. Hash the passwords first
  const doveHash = await bcrypt.hash('swandive', SALT_ROUNDS);
  const ferbHash = await bcrypt.hash('iknowhatwedoing', SALT_ROUNDS);
  const giovanniHash = await bcrypt.hash('gangstar5', SALT_ROUNDS);

  // 2. Define a SQL query string that returns the user_id
  const insertUserSql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id;';

  // 3. Execute queries and store the full result objects
  const doveResponse = await pool.query(insertUserSql, ['dove', doveHash]);
  const ferbResponse = await pool.query(insertUserSql, ['ferb', ferbHash]);
  const giovanniResponse = await pool.query(insertUserSql, ['giovanni', giovanniHash]);

  // 4. Extract the IDs for later use (e.g., seeding bookmarks)
  const doveId = doveResponse.rows[0].user_id;
  const ferbId = ferbResponse.rows[0].user_id;
  const giovanniId = giovanniResponse.rows[0].user_id;

  const eventQuery = 'INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING event_id';
  const doveEventResponse = await pool.query(eventQuery, ['Sunset Swim Meet', 'Competitive swimming event at the outdoor pool', '2025-06-15', 'Riverside Aquatic Center', 'sports', 200, doveId]);
  const ferbEventResponse = await pool.query(eventQuery, ['Backyard Build-a-thon', 'A full day of DIY projects and engineering fun', '2025-07-04', 'Danville Community Park', 'workshop', 50, ferbId]);
  const giovanniEventResponse = await pool.query(eventQuery, ['Street Fest Downtown', 'Live music, food trucks, and urban culture showcase', '2025-08-20', 'Downtown Plaza', 'concert', 500, giovanniId]);

  const doveEventId = doveEventResponse.rows[0].event_id;
  const ferbEventId = ferbEventResponse.rows[0].event_id;
  const giovanniEventId = giovanniEventResponse.rows[0].event_id;

  // NEW: seed some bookmarks so the app has data to display on first load
  const rsvpQuery = 'INSERT INTO rsvps (user_id, event_id) VALUES ($1, $2)';
  await pool.query(rsvpQuery, [ferbId, doveEventId]);
  await pool.query(rsvpQuery, [giovanniId, doveEventId]);
  await pool.query(rsvpQuery, [doveId, ferbEventId]);
  await pool.query(rsvpQuery, [giovanniId, ferbEventId]);
  await pool.query(rsvpQuery, [doveId, giovanniEventId]);
  await pool.query(rsvpQuery, [ferbId, giovanniEventId]);

  console.log('Database seeded.');
};

seed()
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
