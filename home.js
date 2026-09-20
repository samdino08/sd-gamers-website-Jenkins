(function () {
  'use strict';
  const PL = window.PL, esc = PL.esc;

  document.addEventListener('DOMContentLoaded', function () {
    const players = PL.getPlayers().slice().sort(function (a, b) { return PL.overall(b) - PL.overall(a); });
    const events = PL.getEvents().filter(function (e) { return PL.eventState(e) !== 'past'; })
      .sort(function (a, b) { return a.start - b.start; });
    const totalMatches = players.reduce(function (s, p) { return s + p.record.p; }, 0);

    PL.heroCanvas(PL.$('#hero-canvas'));

    /* hero showcase card = current top-rated player */
    PL.$('#hero-card').innerHTML = PL.playerCard(players[0], true);
    PL.$('#hero-card-caption').textContent = 'Top rated this week: ' + players[0].tag;

    /* counters */
    PL.$('#stat-players').setAttribute('data-count', players.length);
    PL.$('#stat-events').setAttribute('data-count', events.length);
    PL.$('#stat-matches').setAttribute('data-count', totalMatches);
    PL.animateCounters(document);

    /* top players */
    PL.$('#top-players').innerHTML = players.slice(0, 4).map(function (p) { return PL.playerCard(p); }).join('');

    /* next events */
    PL.$('#next-events').innerHTML = events.slice(0, 3).map(function (e) {
      const g = PL.game(e.game), pct = Math.round(e.signups.length / e.max * 100);
      return '<a class="ev-mini tilt" href="events.html">' +
        '<span class="ev-mini-art">' + PL.gameArt(g) + '</span>' +
        '<span class="ev-mini-body"><span class="ev-meta">' + esc(g.short) + ' \u00b7 ' + esc(PL.MODES[e.mode]) + '</span>' +
        '<strong>' + esc(e.title) + '</strong>' +
        '<span class="ev-when">' + esc(PL.fmtWhen(e.start)) + '</span>' +
        '<span class="slots"><span style="width:' + pct + '%"></span></span>' +
        '<span class="ev-count">' + e.signups.length + ' of ' + e.max + ' players \u00b7 ' + esc(PL.countdown(e)) + '</span></span></a>';
    }).join('');

    /* games strip */
    PL.$('#game-strip').innerHTML = PL.GAMES.slice(0, 4).map(function (g) { return PL.gameCard(g); }).join('');

    /* player cards open their profile on the players page */
    document.addEventListener('click', function (e) {
      const b = e.target.closest ? e.target.closest('[data-player]') : null;
      if (b) window.location.href = 'players.html?p=' + encodeURIComponent(b.getAttribute('data-player'));
    });
  });
})();
