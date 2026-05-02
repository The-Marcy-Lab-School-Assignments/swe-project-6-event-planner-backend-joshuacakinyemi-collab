**1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?**

When building my seed.js file, I needed data to fill my database for three users and their events. I had already written the query strings and hashed passwords, but needed the values to pass in. I asked AI:
Give me three pool.queries with this info: 

```js
const doveHash = await bcrypt.hash('swandive', SALT_ROUNDS);
const ferbHash = await bcrypt.hash('iknowhatwedoing', SALT_ROUNDS);
const giovanniHash = await bcrypt.hash('gangstar5', SALT_ROUNDS);

const insertUserSql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id;';

 const eventQuery = 'INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7).'
 ```
I chose AI for this because manually typing different data for every field across multiple rows would have been tedious. AI is good at generating data when you give it a pattern to follow.

**2. How did you evaluate whether the AI's output was correct or useful before using it?**

The AI produced three pool.query calls with values for each field. I checked that each value matched the right parameter, and  I then ran my seed.js to confirm the data was inserted correctly.

**3. How did what the AI produced differ from what you ultimately used, and what does that tell you about your own understanding of the problem?**

The output was mostly usable but had a few issues I had to fix myself. The eventQuery was missing RETURNING event_id, which meant I couldn't extract the event IDs to use in the RSVP inserts later. I had to add those myself once I understood why the RSVP seeding was failing. This told me I understood the data flow of the seed file; I just needed help with the repetitive parts, not the logic.

**4. What did you learn from using AI in this way?**

When creating the project backend, I follow the creation step by step, following a template. When using AI to check for any errors or typos, the AI produces and checks to make sure the user's password credinal is corrent before performing any actions.  It means I would need to create more than what I could copy off
