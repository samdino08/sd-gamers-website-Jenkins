(function () {
  'use strict';
  const PL = window.PL;

  document.addEventListener('DOMContentLoaded', function () {
    const cats = ['All'].concat(PL.GAMES.map(function (g) { return g.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    const upcoming = PL.getEvents().filter(function (e) { return PL.eventState(e) !== 'past'; });
    let current = 'All';

    const chips = PL.$('#game-filters'), grid = PL.$('#game-grid');
    chips.innerHTML = cats.map(function (c) { return '<button type="button" class="chip" data-cat="' + PL.esc(c) + '" aria-pressed="' + (c === 'All') + '">' + PL.esc(c) + '</button>'; }).join('');

    function draw() {
      const list = PL.GAMES.filter(function (g) { return current === 'All' || g.cat === current; });
      grid.innerHTML = list.map(function (g) {
        const n = upcoming.filter(function (e) { return e.game === g.id; }).length;
        const extra = '<p class="game-events">' + (n ? n + ' upcoming event' + (n > 1 ? 's' : '') : 'No events yet') + '</p>' +
          '<a class="btn btn-small" href="events.html?new=' + g.id + '">Schedule an event</a>';
        return PL.gameCard(g, extra);
      }).join('');
      PL.$$('.chip', chips).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === current)); });
    }
    chips.addEventListener('click', function (e) {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      current = b.getAttribute('data-cat'); draw();
    });
    draw();
  });
})();
