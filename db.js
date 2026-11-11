// AI Tool: Claude (Claude Code by Anthropic)
// Chat Log Link: PDF export attached to my final report (Chapter 4)
// Prompts: "Track 2, baseball log" then step-by-step build requests (full list in the chat log)

// db.js: opens the SQLite database and makes sure the games table exists.
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

// A file instead of ":memory:" (what we used in class) so the data survives a server restart.
// __dirname = this file's folder, so the database always lands in the project folder.
const db = new DatabaseSync(path.join(__dirname, "baseball.db"));

// One row = one player's hitting line from one game.
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT NOT NULL,
    game_date TEXT NOT NULL,
    opponent TEXT NOT NULL,
    at_bats INTEGER NOT NULL,
    hits INTEGER NOT NULL,
    home_runs INTEGER NOT NULL DEFAULT 0,
    rbi INTEGER NOT NULL DEFAULT 0
  )
`);

module.exports = db;
