const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

function init() {
  db.serialize(() => {
    // Members table
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table (for the other section – minimal stub)
    db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        video TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

module.exports = { db, init };