(function () {
  'use strict';
  const PL = window.PL, esc = PL.esc;

  document.addEventListener('DOMContentLoaded', function () {
    let filter = 'upcoming', month = new Date(), selectedDay = null;
    month = new Date(month.getFullYear(), month.getMonth(), 1);

    const list = PL.$('#event-list'), cal = PL.$('#calendar'), calTitle = PL.$('#cal-title');
    const dlg = PL.$('#event-dialog'), dbody = PL.$('#event-body');
    const newDlg = PL.$('#new-dialog'), form = PL.$('#new-form'), formError = PL.$('#new-error');
    PL.wireDialog(dlg); PL.wireDialog(newDlg);

    const dayKey = function (ts) { const d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); };
    const byId = function (id) { return PL.getEvents().filter(function (e) { return e.id === id; })[0]; };
    function miniAv(p) { return '<span class="mini-av" title="' + esc(p.tag) + '">' + PL.avatar(p) + '</span>'; }
    function pctFull(e) { return Math.round(e.signups.length / e.max * 100); }

    /* ---------- filters ---------- */
    const FILTERS = [
      { id: 'upcoming', label: 'Upcoming' }, { id: 'fc24', label: 'FIFA 24' }, { id: 'other', label: 'Other games' },
      { id: 'open', label: 'Open spots' }, { id: 'past', label: 'Past' }
    ];
    const chips = PL.$('#event-filters');
    chips.innerHTML = FILTERS.map(function (f) { return '<button type="button" class="chip" data-filter="' + f.id + '" aria-pressed="' + (f.id === filter) + '">' + f.label + '</button>'; }).join('');
    chips.addEventListener('click', function (e) {
      const b = e.target.closest('[data-filter]'); if (!b) return;
      filter = b.getAttribute('data-filter'); selectedDay = null; drawAll();
    });
    function passes(e) {
      const s = PL.eventState(e);
      switch (filter) {
        case 'fc24': return s !== 'past' && e.game === 'fc24';
        case 'other': return s !== 'past' && e.game !== 'fc24';
        case 'open': return s === 'open';
        case 'past': return s === 'past';
        default: return s !== 'past';
      }
    }

    /* ---------- event cards ---------- */
    function actionButton(e, me) {
      const s = PL.eventState(e), joined = me && e.signups.indexOf(me) !== -1;
      if (s === 'past') return '<button type="button" class="btn" disabled>Finished</button>';
      if (joined) return '<button type="button" class="btn btn-ghost" data-leave="' + e.id + '">Leave</button>';
      if (s === 'full') return '<button type="button" class="btn" disabled>Full</button>';
      if (s === 'live') return '<button type="button" class="btn" disabled>In progress</button>';
      return '<button type="button" class="btn" data-join="' + e.id + '">Join</button>';
    }
    function eventCard(e) {
      const g = PL.game(e.game), me = PL.getMe(), s = PL.eventState(e), d = new Date(e.start);
      const players = e.signups.map(PL.playerById).filter(Boolean);
      const shown = players.slice(0, 6).map(miniAv).join('');
      const more = players.length > 6 ? '<span class="mini-more">+' + (players.length - 6) + '</span>' : '';
      const joined = me && e.signups.indexOf(me) !== -1;
      return '<article class="event state-' + s + '" data-id="' + e.id + '">' +
        '<div class="ev-art">' + PL.gameArt(g) + '<span class="date-badge"><b>' + d.getDate() + '</b><i>' + d.toLocaleDateString(undefined, { month: 'short' }) + '</i></span></div>' +
        '<div class="ev-main">' +
          '<p class="ev-meta">' + esc(g.short) + ' \u00b7 ' + esc(PL.MODES[e.mode]) + (joined ? ' <span class="tag tag-me">You are in</span>' : '') + '</p>' +
          '<h3>' + esc(e.title) + '</h3>' +
          '<p class="ev-when">' + esc(PL.fmtWhen(e.start)) + ' \u00b7 ' + Math.round(e.duration / 6) / 10 + ' h <span class="ev-count">' + esc(PL.countdown(e)) + '</span></p>' +
          '<div class="slots" aria-hidden="true"><span style="width:' + pctFull(e) + '%"></span></div>' +
          '<p class="slot-text">' + e.signups.length + ' of ' + e.max + ' players</p>' +
          '<div class="stack">' + shown + more + '</div>' +
        '</div>' +
        '<div class="ev-actions">' + actionButton(e, me) +
          '<button type="button" class="btn btn-ghost" data-details="' + e.id + '">Details</button>' +
          '<button type="button" class="btn btn-ghost" data-ics="' + e.id + '" title="Download an .ics file for your calendar app">Add to calendar</button>' +
        '</div></article>';
    }
    function drawList() {
      let events = PL.getEvents().slice();
      let heading;
      if (selectedDay) {
        events = events.filter(function (e) { return dayKey(e.start) === selectedDay; });
        const parts = selectedDay.split('-').map(Number);
        heading = 'Events on ' + new Date(parts[0], parts[1], parts[2]).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      } else {
        events = events.filter(passes);
        heading = FILTERS.filter(function (f) { return f.id === filter; })[0].label + ' events';
      }
      events.sort(function (a, b) { return filter === 'past' && !selectedDay ? b.start - a.start : a.start - b.start; });
      PL.$('#list-heading').textContent = heading + ' (' + events.length + ')';
      PL.$('#clear-day').hidden = !selectedDay;
      list.innerHTML = events.length ? events.map(eventCard).join('') :
        '<p class="empty">Nothing here yet. <button type="button" class="linkbtn" data-open-new>Schedule an event</button> and invite the squad.</p>';
      PL.$$('.chip', chips).forEach(function (b) { b.setAttribute('aria-pressed', String(!selectedDay && b.getAttribute('data-filter') === filter)); });
    }

    /* ---------- calendar ---------- */
    function drawCalendar() {
      const y = month.getFullYear(), m = month.getMonth();
      calTitle.textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const startDow = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), today = dayKey(Date.now());
      const map = {};
      PL.getEvents().forEach(function (e) { (map[dayKey(e.start)] = map[dayKey(e.start)] || []).push(e); });
      const dow = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (d) { return '<span class="dow">' + d + '</span>'; }).join('');
      let cells = '';
      for (let i = 0; i < startDow; i++) cells += '<span class="day empty-day"></span>';
      for (let d = 1; d <= days; d++) {
        const key = y + '-' + m + '-' + d, evs = map[key] || [];
        const dots = evs.slice(0, 3).map(function (e) { return '<i style="background:hsl(' + PL.game(e.game).hue[0] + ',85%,62%)"></i>'; }).join('');
        cells += '<button type="button" class="day' + (key === today ? ' today' : '') + (key === selectedDay ? ' selected' : '') + (evs.length ? ' has' : '') +
          '" data-day="' + key + '" aria-label="' + new Date(y, m, d).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) + (evs.length ? ', ' + evs.length + ' event' + (evs.length > 1 ? 's' : '') : ', no events') + '">' +
          '<span>' + d + '</span><span class="dots">' + dots + '</span></button>';
      }
      cal.innerHTML = '<div class="cal-grid">' + dow + cells + '</div>';
    }
    cal.addEventListener('click', function (e) {
      const b = e.target.closest('[data-day]'); if (!b) return;
      selectedDay = selectedDay === b.getAttribute('data-day') ? null : b.getAttribute('data-day'); drawAll();
    });
    PL.$('#cal-prev').addEventListener('click', function () { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); drawCalendar(); });
    PL.$('#cal-next').addEventListener('click', function () { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); drawCalendar(); });
    PL.$('#clear-day').addEventListener('click', function () { selectedDay = null; drawAll(); });

    function drawAll() { drawList(); drawCalendar(); }

    /* ---------- join / leave ---------- */
    function needMe() {
      PL.toast('Choose your profile under "Playing as" in the header first, or add your own profile.');
      const s = PL.$('#me-select'); if (s) s.focus();
    }
    function join(id) {
      const me = PL.getMe(); if (!me) return needMe();
      const events = PL.getEvents(), e = events.filter(function (x) { return x.id === id; })[0];
      if (!e || PL.eventState(e) !== 'open') return PL.toast('This event is not open for sign-ups.');
      if (e.signups.indexOf(me) === -1) { e.signups.push(me); PL.saveEvents(events); PL.toast('You are in: ' + e.title); }
      drawAll(); if (dlg.open) renderDetails(e.id);
    }
    function leave(id) {
      const me = PL.getMe(); if (!me) return;
      const events = PL.getEvents(), e = events.filter(function (x) { return x.id === id; })[0];
      if (!e) return;
      e.signups = e.signups.filter(function (s) { return s !== me; }); PL.saveEvents(events);
      PL.toast('You left ' + e.title); drawAll(); if (dlg.open) renderDetails(e.id);
    }

    /* ---------- calendar file (.ics) ---------- */
    function ics(e) {
      const t = function (ts) { return new Date(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      const q = function (s) { return String(s).replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n'); };
      const g = PL.game(e.game);
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + PL.SITE.name + '//Events//EN', 'BEGIN:VEVENT',
        'UID:' + e.id + '@' + PL.SITE.name.toLowerCase(), 'DTSTAMP:' + t(Date.now()), 'DTSTART:' + t(e.start), 'DTEND:' + t(e.start + e.duration * 60000),
        'SUMMARY:' + q(e.title + ' (' + g.short + ')'), 'DESCRIPTION:' + q(PL.MODES[e.mode] + '. ' + e.desc), 'END:VEVENT', 'END:VCALENDAR'];
      const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = e.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
    }

    /* ---------- details dialog ---------- */
    function seedsFor(e) {
      return e.signups.map(PL.playerById).filter(Boolean).sort(function (a, b) { return PL.overall(b) - PL.overall(a); });
    }
    function row(p, seed) {
      return '<span class="seat">' + (seed ? '<em>#' + seed + '</em>' : '') + miniAv(p) + '<span>' + esc(p.tag) + '</span><b>' + PL.overall(p) + '</b></span>';
    }
    function modePanel(e) {
      const ps = seedsFor(e), n = ps.length;
      if (e.mode === 'knockout') {
        if (n < 2) return '<p class="hint">The bracket appears once two players have joined.</p>';
        let pool = ps.slice(), bye = null;
        if (n % 2) bye = pool.shift();
        const rounds = Math.ceil(Math.log(n) / Math.log(2));
        let html = '<h4>Round 1 pairings <small>(seeded by rating, ' + rounds + ' rounds in total)</small></h4><div class="bracket">';
        for (let i = 0; i < pool.length / 2; i++) {
          const a = pool[i], b = pool[pool.length - 1 - i], seedA = bye ? i + 2 : i + 1, seedB = bye ? pool.length - i + 1 : pool.length - i;
          html += '<div class="match">' + row(a, seedA) + '<span class="vs">vs</span>' + row(b, seedB) + '</div>';
        }
        if (bye) html += '<div class="match bye">' + row(bye, 1) + '<span class="vs">bye</span></div>';
        return html + '</div><p class="hint">Later rounds are set as winners advance.</p>';
      }
      if (e.mode === 'teams') {
        if (n < 2) return '<p class="hint">Teams are balanced automatically once two players have joined.</p>';
        const A = [], B = [];
        ps.forEach(function (p, i) { (i % 4 === 0 || i % 4 === 3 ? A : B).push(p); });
        const avg = function (l) { return l.length ? Math.round(l.reduce(function (s, p) { return s + PL.overall(p); }, 0) / l.length) : 0; };
        const col = function (name, l) { return '<div class="team"><h5>' + name + ' <small>avg ' + avg(l) + '</small></h5>' + l.map(function (p) { return row(p); }).join('') + '</div>'; };
        return '<h4>Balanced teams <small>(snake draft by rating)</small></h4><div class="teams">' + col('Team A', A) + col('Team B', B) + '</div>';
      }
      if (e.mode === 'league') {
        if (n < 2) return '<p class="hint">Fixtures appear once two players have joined.</p>';
        return '<h4>Round-robin</h4><p>Everyone plays everyone once: <b>' + (n * (n - 1) / 2) + ' fixtures</b> over <b>' + (n % 2 ? n : n - 1) + ' rounds</b>. Points: 3 for a win, 1 for a draw.</p>';
      }
      return '<h4>Casual session</h4><p>No brackets. Just join the lobby together and play.</p>';
    }
    function renderDetails(id) {
      const e = byId(id); if (!e) return;
      const g = PL.game(e.game), host = PL.playerById(e.host), me = PL.getMe();
      const roster = seedsFor(e);
      dbody.innerHTML =
        '<header class="ed-head"><div class="ed-art">' + PL.gameArt(g) + '</div><div class="ed-title">' +
          '<p class="ev-meta">' + esc(g.title) + ' \u00b7 ' + esc(PL.MODES[e.mode]) + '</p><h2 id="ed-title">' + esc(e.title) + '</h2>' +
          '<p class="ev-when">' + esc(PL.fmtDay(e.start)) + ' at ' + esc(PL.fmtTime(e.start)) + ' \u00b7 ' + Math.round(e.duration / 6) / 10 + ' h</p>' +
          '<p class="ev-count">' + esc(PL.countdown(e)) + (host ? ' \u00b7 Hosted by ' + esc(host.tag) : '') + '</p></div></header>' +
        '<p class="ed-desc">' + esc(e.desc) + '</p>' +
        '<div class="ed-slots"><div class="slots"><span style="width:' + pctFull(e) + '%"></span></div><p class="slot-text">' + e.signups.length + ' of ' + e.max + ' places taken</p></div>' +
        '<div class="ed-cols"><section><h4>Roster</h4><div class="roster">' + (roster.length ? roster.map(function (p) { return row(p); }).join('') : '<p class="hint">No players yet. Be the first.</p>') + '</div></section>' +
        '<section>' + modePanel(e) + '</section></div>' +
        '<footer class="pf-foot">' + actionButton(e, me) + '<button type="button" class="btn btn-ghost" data-ics="' + e.id + '">Add to calendar</button><button type="button" class="btn btn-ghost" data-close>Close</button></footer>';
      PL.$$('[data-close]', dbody).forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    }
    function openDetails(id) { renderDetails(id); PL.openDialog(dlg); }

    /* ---------- delegated clicks ---------- */
    document.addEventListener('click', function (ev) {
      const t = ev.target.closest ? ev.target.closest('[data-join],[data-leave],[data-details],[data-ics],[data-open-new]') : null;
      if (!t) return;
      if (t.hasAttribute('data-join')) join(t.getAttribute('data-join'));
      else if (t.hasAttribute('data-leave')) leave(t.getAttribute('data-leave'));
      else if (t.hasAttribute('data-details')) openDetails(t.getAttribute('data-details'));
      else if (t.hasAttribute('data-ics')) { const e = byId(t.getAttribute('data-ics')); if (e) ics(e); }
      else if (t.hasAttribute('data-open-new')) openNew();
    });

    /* ---------- create event ---------- */
    const pad = function (n) { return String(n).padStart(2, '0'); };
    const toLocalInput = function (ts) { const d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
    PL.$('#ev-game').innerHTML = PL.GAMES.map(function (g) { return '<option value="' + g.id + '">' + esc(g.title) + '</option>'; }).join('');
    PL.$('#ev-mode').innerHTML = Object.keys(PL.MODES).map(function (k) { return '<option value="' + k + '">' + esc(PL.MODES[k]) + '</option>'; }).join('');

    function openNew(gameId) {
      form.reset(); formError.hidden = true;
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(20, 0, 0, 0);
      form.elements.start.value = toLocalInput(d.getTime()); form.elements.start.min = toLocalInput(Date.now());
      if (gameId && PL.GAMES.some(function (g) { return g.id === gameId; })) form.elements.game.value = gameId;
      PL.$('#new-hint').hidden = !!PL.getMe();
      PL.openDialog(newDlg);
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const f = form.elements, me = PL.getMe();
      const err = function (m) { formError.textContent = m; formError.hidden = false; };
      if (!me) return err('Choose your profile under "Playing as" in the header (or add a profile) so we know who is hosting.');
      const title = f.title.value.trim(), start = new Date(f.start.value).getTime(), max = parseInt(f.max.value, 10), dur = parseInt(f.duration.value, 10);
      if (title.length < 3) return err('Give the event a title of at least 3 characters.');
      if (isNaN(start) || start < Date.now()) return err('Pick a start time in the future.');
      if (!(max >= 2 && max <= 64)) return err('Max players must be between 2 and 64.');
      if (!(dur >= 15 && dur <= 480)) return err('Duration must be between 15 minutes and 8 hours.');
      const events = PL.getEvents();
      events.push({ id: 'ev' + Date.now().toString(36), title: title.slice(0, 60), game: f.game.value, mode: f.mode.value, start: start,
        duration: dur, max: max, host: me, signups: [me], desc: f.desc.value.trim().slice(0, 300) || 'Join us for a match night.' });
      PL.saveEvents(events); newDlg.close(); filter = 'upcoming'; selectedDay = null;
      month = new Date(new Date(start).getFullYear(), new Date(start).getMonth(), 1);
      drawAll(); PL.toast('Event scheduled: ' + title);
    });

    document.addEventListener('pl:me', drawAll);

    drawAll();
    const params = new URLSearchParams(window.location.search);
    if (params.get('new')) openNew(params.get('new'));
    setInterval(function () { if (!dlg.open && !newDlg.open) drawList(); }, 60000);
  });
})();
