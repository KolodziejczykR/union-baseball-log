// AI Tool: Claude (Claude Code by Anthropic)
// Chat Log Link: PDF export attached to my final report (Chapter 4)
// Prompts: "Track 2, baseball log" then step-by-step build requests (full list in the chat log)

// views/page.js: builds the HTML page as a string (same idea as HTML_FORM in class).

// Makes typed text safe to put in HTML: a name like <b>Ryan</b> shows as text instead of becoming a tag.
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Batting average written the baseball way: 2 hits in 6 at-bats -> ".333".
function formatAvg(hits, atBats) {
  if (atBats === 0) return "---";
  return (hits / atBats).toFixed(3).replace(/^0/, "");
}

function renderRow(game) {
  return `
    <tr>
      <td>${escapeHtml(game.game_date)}</td>
      <td>${escapeHtml(game.player)}</td>
      <td>${escapeHtml(game.opponent)}</td>
      <td>${game.at_bats}</td>
      <td>${game.hits}</td>
      <td>${game.home_runs}</td>
      <td>${game.rbi}</td>
      <td>${formatAvg(game.hits, game.at_bats)}</td>
    </tr>`;
}

function renderPage(games) {
  const rows = games.length
    ? games.map(renderRow).join("")
    : `<tr><td colspan="8" class="empty">No games logged yet. Add the first one above.</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Union Baseball Log</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1>Union Baseball Log</h1>
    <p>Log each hitter's game line. Every entry is saved in a SQLite database.</p>
  </header>

  <main>
    <section class="card">
      <h2>Add a game line</h2>
      <form action="/games" method="POST" class="game-form">
        <label>Player <input type="text" name="player" required></label>
        <label>Date <input type="date" name="game_date" required></label>
        <label>Opponent <input type="text" name="opponent" required></label>
        <label>At-bats <input type="number" name="at_bats" min="0" value="0" required></label>
        <label>Hits <input type="number" name="hits" min="0" value="0" required></label>
        <label>Home runs <input type="number" name="home_runs" min="0" value="0" required></label>
        <label>RBI <input type="number" name="rbi" min="0" value="0" required></label>
        <button type="submit">Save game</button>
      </form>
    </section>

    <section class="card">
      <h2>Game log</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Player</th><th>Opponent</th>
              <th>AB</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

module.exports = { renderPage };
