// ====================================
// Imports / Constants
// ====================================

// ✍️ TODO 1: Import dotenv and invoke config()

const path = require('path');
const express = require('express');
require('dotenv').config();

const cookieSession = require('cookie-session');

const logRoutes = require('./middleware/logRoutes');

const checkAuthentication = require('./middleware/checkAuthentication');

const { register, login, getMe, logout } = require('./controllers/authControllers');
const { listUsers, updateUser, deleteUser } = require('./controllers/userControllers');
const { listEvents, listUserEvents, createEvent, updateEvent, deleteEvent } = require('./controllers/eventControllers'); // NEW
const { listRsvps, listUserRsvps, createRsvp, deleteRsvp } = require('./controllers/rsvpControllers'); // NEW

const app = express();

// ✍️ TODO 2: Replace hard-coded PORT with `process.env.PORT || 8080`
const PORT = process.env.PORT || 8080;
const pathToFrontend = process.env.NODE_ENV === 'production' ? '../frontend/dist' : '../frontend';

// ====================================
// Middleware
// ====================================

app.use(logRoutes);

// ✍️ TODO 3: Replace hard-coded secret with `process.env.SESSION_SECRET`
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, pathToFrontend)));

// ====================================
// Auth routes (public)
// ====================================

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', getMe);
app.delete('/api/auth/logout', logout);

// ====================================
// User routes
// ====================================

app.get('/api/users', listUsers);
app.get('/api/users/:user_id/rsvps', listUserRsvps); // NEW: returns bookmarks for one user
app.get('/api/users/:user_id/events', listUserEvents); // NEW: returns bookmarks for one user
app.patch('/api/users/:user_id', checkAuthentication, updateUser);
app.delete('/api/users/:user_id', checkAuthentication, deleteUser);

// ====================================
// Event routes — NEW
// ====================================

// Public feed — no authentication required
app.get('/api/events', listEvents);
// Write routes require a valid session
app.post('/api/events', checkAuthentication, createEvent);
app.patch('/api/events/:event_id', checkAuthentication, updateEvent);
app.delete('/api/events/:event_id', checkAuthentication, deleteEvent);

// ====================================
// Rsvp routes — NEW
// ====================================

// Public feed — no authentication required
app.get('/api/rsvps', listRsvps);
app.get('/api/users/:user_id/rsvps', listUserRsvps);
// Write routes require a valid session
app.post('/api/events/:event_id/rsvps', checkAuthentication, createRsvp);
app.delete('/api/events/:event_id/rsvps', checkAuthentication, deleteRsvp);
// ====================================
// Global Error Handling
// ====================================

const handleError = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
};

app.use(handleError);

// ====================================
// Listen
// ====================================

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
4