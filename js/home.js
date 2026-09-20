(function () {
  'use strict';
  const PL = window.PL, esc = PL.esc;

  document.addEventListener('DOMContentLoaded', function () {
    const players = PL.getPlayers().slice().sort(function (a, b) { return PL.overall(b) - PL.overall(a); });
    const events = PL.getEvents().filter(function (e) { return PL.eventState(e) !== 'past'; })
      .sort(function (a, b) { return a.start - b.start; });
    const totalMatches = players.reduce(function (s, p) { return s + p.record.p; }, 0);

    PL.heroCanvas(PL.$('#hero-canvas'));

    /* text and choices from PL.HOME in js/data.js */
    const H = PL.HOME || {};
    function setText(sel, v) { const el = PL.$(sel); if (el && v) el.textContent = v; }
    function setLink(sel, o) { const el = PL.$(sel); if (el && o) { if (o.text) el.textContent = o.text; if (o.href) el.setAttribute('href', o.href); } }
    setText('#home-title', H.heroTitle); setText('#home-lead', H.heroLead);
    setLink('#cta-primary', H.primaryButton); setLink('#cta-secondary', H.secondaryButton);
    setText('#title-top', H.topPlayersTitle); setText('#title-events', H.eventsTitle); setText('#title-games', H.gamesTitle);
    setText('#cta-title', H.ctaTitle); setText('#cta-text', H.ctaText);
    if (H.ctaButton) PL.$('#cta-button').textContent = H.ctaButton;
    const S = H.stats || {};
    const stat = function (v, auto) { return (v === null || v === undefined || v === '') ? auto : v; };
    const featured = (H.heroPlayer && players.filter(function (p) { return p.tag.toLowerCase() === String(H.heroPlayer).toLowerCase(); })[0]) || players[0];

    /* hero showcase card = current top-rated player */
    PL.$('#hero-card').innerHTML = PL.playerCard(featured, true);
    PL.$('#hero-card-caption').textContent = (featured === players[0] ? 'Top rated this week: ' : 'Featured player: ') + featured.tag;

    /* counters */
    PL.$('#stat-players').setAttribute('data-count', stat(S.players, players.length));
    PL.$('#stat-events').setAttribute('data-count', stat(S.events, events.length));
    PL.$('#stat-matches').setAttribute('data-count', stat(S.matches, totalMatches));
    PL.animateCounters(document);

    /* top players */
    PL.$('#top-players').innerHTML = players.slice(0, Math.max(1, Math.min(H.topPlayersCount || 4, players.length))).map(function (p) { return PL.playerCard(p); }).join('');

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
    const wanted = (H.featuredGames || []).map(function (id) { return PL.GAMES.filter(function (g) { return g.id === id; })[0]; }).filter(Boolean);
    PL.$('#game-strip').innerHTML = (wanted.length ? wanted : PL.GAMES.slice(0, 4)).map(function (g) { return PL.gameCard(g); }).join('');

    /* player cards open their profile on the players page */
    document.addEventListener('click', function (e) {
      const b = e.target.closest ? e.target.closest('[data-player]') : null;
      if (b) window.location.href = 'players.html?p=' + encodeURIComponent(b.getAttribute('data-player'));
    });
  });
})();
