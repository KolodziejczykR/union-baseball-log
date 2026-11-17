// AI Tool: Claude (Claude Code by Anthropic)
// Chat Log Link: PDF export attached to my final report (Chapter 4)
// Prompts: "Track 2, baseball log" then step-by-step build requests (full list in the chat log)

// routes/games.js: the URL handlers. GET shows data, POST changes data.
const express = require("express");
const db = require("../db");
const { renderPage, renderEditPage, renderMessage } = require("../views/page");

const router = express.Router();

// Pulls the game fields out of a submitted form, turns the stat boxes into numbers,
// and returns an error message if the line doesn't make sense.
function readGameForm(body) {
  const game = {
    player: (body.player || "").trim(),
    game_date: body.game_date || "",
    opponent: (body.opponent || "").trim(),
    at_bats: Number(body.at_bats),
    hits: Number(body.hits),
    home_runs: Number(body.home_runs),
    rbi: Number(body.rbi),
  };
  const stats = [game.at_bats, game.hits, game.home_runs, game.rbi];

  let error = null;
  if (!game.player || !game.game_date || !game.opponent) {
    error = "Player, date, and opponent are required.";
  } else if (stats.some((n) => !Number.isInteger(n) || n < 0)) {
    error = "Stats must be whole numbers, 0 or more.";
  } else if (game.hits > game.at_bats) {
    error = "Hits can't be more than at-bats.";
  } else if (game.home_runs > game.hits) {
    error = "Home runs can't be more than hits.";
  }
  return { game, error };
}

// Reads everything the home page shows: every game line (newest first) and the season leaderboard.
// Both GET / and a failed save (POST /games) need this, so it lives in one function.
function loadHomeData() {
  const games = db
    .prepare("SELECT * FROM games ORDER BY game_date DESC, id DESC")
    .all();

  // GROUP BY squashes each player's game rows into one row of season totals.
  // CAST(... AS REAL) forces decimal division: in SQLite 2 / 4 = 0, but 2.0 / 4 = 0.5.
  // A player with 0 at-bats gets avg = NULL (SQLite's answer to dividing by 0), and NULLs sort last.
  const leaders = db
    .prepare(`
      SELECT player,
             COUNT(*) AS games,
             SUM(at_bats) AS at_bats,
             SUM(hits) AS hits,
             SUM(home_runs) AS home_runs,
             SUM(rbi) AS rbi,
             CAST(SUM(hits) AS REAL) / SUM(at_bats) AS avg
      FROM games
      GROUP BY player
      ORDER BY avg DESC, hits DESC
    `)
    .all();

  return { games, leaders };
}

// READ: the home page with an empty add form.
router.get("/", (req, res) => {
  const { games, leaders } = loadHomeData();
  res.send(renderPage(games, leaders));
});

// CREATE: save one game line from the form, then send the browser back to "/".
router.post("/games", (req, res) => {
  const { game, error } = readGameForm(req.body);
  if (error) {
    // Nothing is saved. The home page comes back with the error and the typed values
    // still in the form (game holds what was submitted), so only the bad box needs fixing.
    const { games, leaders } = loadHomeData();
    return res.status(400).send(renderPage(games, leaders, game, error));
  }

  // The ? placeholders keep typed text as data, never as SQL (stops SQL injection).
  db.prepare(`
    INSERT INTO games (player, game_date, opponent, at_bats, hits, home_runs, rbi)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(game.player, game.game_date, game.opponent, game.at_bats, game.hits, game.home_runs, game.rbi);

  // 302 redirect (Post/Redirect/Get): a page refresh won't submit the same game twice.
  res.redirect("/");
});

// The edit page: the same form as "add", filled in with this game's current numbers.
// :id in the URL shows up as req.params.id (always a string, so we convert it).
router.get("/games/:id/edit", (req, res) => {
  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(Number(req.params.id));
  if (!game) {
    return res.status(404).send(renderMessage("Game not found", "That game line doesn't exist. It may have been deleted."));
  }
  res.send(renderEditPage(game));
});

// UPDATE: overwrite one game line with the edited form values.
router.post("/games/:id", (req, res) => {
  const { game, error } = readGameForm(req.body);
  if (error) {
    // Same idea as a failed add: show the edit form again with what was typed.
    // game came from the form, which has no id field, so add it back for the form's action URL.
    game.id = Number(req.params.id);
    return res.status(400).send(renderEditPage(game, error));
  }

  db.prepare(`
    UPDATE games
    SET player = ?, game_date = ?, opponent = ?, at_bats = ?, hits = ?, home_runs = ?, rbi = ?
    WHERE id = ?
  `).run(game.player, game.game_date, game.opponent, game.at_bats, game.hits, game.home_runs, game.rbi, Number(req.params.id));

  res.redirect("/");
});

// DELETE: HTML forms can only send GET or POST, so delete is a POST to its own URL.
router.post("/games/:id/delete", (req, res) => {
  db.prepare("DELETE FROM games WHERE id = ?").run(Number(req.params.id));
  res.redirect("/");
});

module.exports = router;
