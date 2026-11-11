// AI Tool: Claude (Claude Code by Anthropic)
// Chat Log Link: PDF export attached to my final report (Chapter 4)
// Prompts: "Track 2, baseball log" then step-by-step build requests (full list in the chat log)

// server.js: starts the Express server and plugs in the pieces.
const path = require("node:path");
const express = require("express");
const gamesRouter = require("./routes/games");

const app = express();
// Use the PORT environment variable if one is set (e.g. PORT=4000 npm start), otherwise 3000.
const PORT = process.env.PORT || 3000;

// Turns a submitted form body (player=Ryan&hits=2...) into the req.body object.
app.use(express.urlencoded({ extended: false }));

// Serves files in /public as-is, e.g. /css/style.css.
app.use(express.static(path.join(__dirname, "public")));

// Every page and form action lives in routes/games.js.
app.use("/", gamesRouter);

app.listen(PORT, () => {
  console.log(`Union Baseball Log running at http://localhost:${PORT}`);
});
