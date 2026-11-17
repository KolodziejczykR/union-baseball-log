// AI Tool: Claude (Claude Code by Anthropic)
// Chat Log Link: PDF export attached to my final report (Chapter 4)
// Prompts: "Track 2, baseball log" then step-by-step build requests (full list in the chat log)

// views/page.js: builds the HTML pages as strings (same idea as HTML_FORM in class).

// Makes typed text safe to put in HTML: a name like <b>Ryan</b> shows as text instead of becoming a tag.
// Escaping " matters too, because names also go inside value="..." on the edit form.
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

// The outside of every page: head, header, and a <main> for the page's own content.
function layout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Union Baseball Log</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1><a href="/">Union Baseball Log</a></h1>
    <p>Log each hitter's game line. Every entry is saved in a SQLite database.</p>
  </header>
  <main>${content}</main>
</body>
</html>`;
}

// One form used two ways: blank for "add", filled in for "edit".
// error is null normally; after a failed save it holds the message shown above the form.
function renderGameForm(action, game, buttonText, error = null) {
  const errorBox = error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : "";
  return `
    ${errorBox}
    <form action="${action}" method="POST" class="game-form">
      <label>Player <input type="text" name="player" value="${escapeHtml(game.player)}" required></label>
      <label>Date <input type="date" name="game_date" value="${escapeHtml(game.game_date)}" required></label>
      <label>Opponent <input type="text" name="opponent" value="${escapeHtml(game.opponent)}" required></label>
      <label>At-bats <input type="number" name="at_bats" min="0" value="${game.at_bats}" required></label>
      <label>Hits <input type="number" name="hits" min="0" value="${game.hits}" required></label>
      <label>Home runs <input type="number" name="home_runs" min="0" value="${game.home_runs}" required></label>
      <label>RBI <input type="number" name="rbi" min="0" value="${game.rbi}" required></label>
      <button type="submit">${buttonText}</button>
    </form>`;
}

const EMPTY_GAME = { player: "", game_date: "", opponent: "", at_bats: 0, hits: 0, home_runs: 0, rbi: 0 };

// One row of the season leaderboard (rank = position after sorting by AVG).
function renderLeaderRow(leader, index) {
  return `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(leader.player)}</td>
      <td>${leader.games}</td>
      <td>${leader.at_bats}</td>
      <td>${leader.hits}</td>
      <td>${leader.home_runs}</td>
      <td>${leader.rbi}</td>
      <td><strong>${formatAvg(leader.hits, leader.at_bats)}</strong></td>
    </tr>`;
}

// One row of the game log, with its Edit link and Delete button.
function renderGameRow(game) {
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
      <td class="actions">
        <a href="/games/${game.id}/edit">Edit</a>
        <form action="/games/${game.id}/delete" method="POST" onsubmit="return confirm('Delete this game line?')">
          <button type="submit" class="link-button">Delete</button>
        </form>
      </td>
    </tr>`;
}

// The home page: add form, season leaderboard, and the full game log.
// formGame and formError are only passed after a failed save, to refill the add form.
function renderPage(games, leaders, formGame = EMPTY_GAME, formError = null) {
  const leaderRows = leaders.length
    ? leaders.map(renderLeaderRow).join("")
    : `<tr><td colspan="8" class="empty">The leaderboard fills in once games are logged.</td></tr>`;

  const gameRows = games.length
    ? games.map(renderGameRow).join("")
    : `<tr><td colspan="9" class="empty">No games logged yet. Add the first one above.</td></tr>`;

  return layout("Home", `
    <section class="card">
      <h2>Add a game line</h2>
      ${renderGameForm("/games", formGame, "Save game", formError)}
    </section>

    <section class="card">
      <h2>Season leaderboard</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Player</th><th>G</th><th>AB</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th></tr>
          </thead>
          <tbody>${leaderRows}</tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h2>Game log</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Player</th><th>Opponent</th><th>AB</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th><th></th></tr>
          </thead>
          <tbody>${gameRows}</tbody>
        </table>
      </div>
    </section>`);
}

// The edit page: the shared form, pre-filled, posting back to /games/:id.
function renderEditPage(game, error = null) {
  return layout("Edit game", `
    <section class="card">
      <h2>Edit game line</h2>
      ${renderGameForm(`/games/${game.id}`, game, "Save changes", error)}
      <p><a href="/">Cancel</a></p>
    </section>`);
}

// A simple page for errors that have no form to refill, like "Game not found".
function renderMessage(title, text) {
  return layout(title, `
    <section class="card">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
      <p><a href="/">Return to the log</a>.</p>
    </section>`);
}

module.exports = { renderPage, renderEditPage, renderMessage };
