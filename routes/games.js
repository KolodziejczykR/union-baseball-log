// AI Tool: Claude (Claude Code by Anthropic)
// Chat Log Link: PDF export attached to my final report (Chapter 4)
// Prompts: "Track 2, baseball log" then step-by-step build requests (full list in the chat log)

// routes/games.js: the URL handlers. GET shows data, POST changes data.
const express = require("express");
const db = require("../db");
const { renderPage } = require("../views/page");

const router = express.Router();

// READ: get every game line (newest first) and send back the full page.
router.get("/", (req, res) => {
  const games = db
    .prepare("SELECT * FROM games ORDER BY game_date DESC, id DESC")
    .all();
  res.send(renderPage(games));
});

// CREATE: save one game line from the form, then send the browser back to "/".
router.post("/games", (req, res) => {
  const { player, game_date, opponent, at_bats, hits, home_runs, rbi } = req.body;

  // The ? placeholders keep typed text as data, never as SQL (stops SQL injection).
  db.prepare(
    "INSERT INTO games (player, game_date, opponent, at_bats, hits, home_runs, rbi) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(player, game_date, opponent, Number(at_bats), Number(hits), Number(home_runs), Number(rbi));

  // 302 redirect (Post/Redirect/Get): a page refresh won't submit the same game twice.
  res.redirect("/");
});

module.exports = router;
