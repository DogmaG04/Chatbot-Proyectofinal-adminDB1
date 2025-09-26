require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.PG_CONNECTION_STRING,
});

client.connect()
  .then(() => {
    console.log('database successful');
    return client.end();
  })
  .catch(err => {
    console.error('database connection failed:', err);
  });