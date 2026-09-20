(function () {
  'use strict';
  const PL = window.PL, esc = PL.esc;

  document.addEventListener('DOMContentLoaded', function () {
    let query = '', sort = 'overall', style = 'All';
    const grid = PL.$('#player-grid'), count = PL.$('#result-count');
    const dlg = PL.$('#profile-dialog'), body = PL.$('#profile-body');
    const addDlg = PL.$('#add-dialog'), form = PL.$('#add-form');
    PL.wireDialog(dlg); PL.wireDialog(addDlg);

    /* ---------- style filter chips ---------- */
    const chips = PL.$('#style-filters');
    chips.innerHTML = ['All'].concat(PL.STYLES).map(function (s) {
      return '<button type="button" class="chip" data-style="' + esc(s) + '" aria-pressed="' + (s === 'All') + '">' + esc(s) + '</button>';
    }).join('');
    chips.addEventListener('click', function (e) {
      const b = e.target.closest('[data-style]'); if (!b) return;
      style = b.getAttribute('data-style');
      PL.$$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      draw();
    });

    /* ---------- grid ---------- */
    const SORTS = {
      overall: function (a, b) { return PL.overall(b) - PL.overall(a); },
      win: function (a, b) { return PL.stats(b).winPct - PL.stats(a).winPct; },
      goals: function (a, b) { return PL.stats(b).gpg - PL.stats(a).gpg; },
      matches: function (a, b) { return b.record.p - a.record.p; },
      community: function (a, b) { return PL.avgRating(b) - PL.avgRating(a); }
    };
    function draw() {
      const q = query.trim().toLowerCase();
      const list = PL.getPlayers().filter(function (p) {
        if (style !== 'All' && p.style !== style) return false;
        return !q || [p.tag, p.name, p.country, p.club].join(' ').toLowerCase().indexOf(q) !== -1;
      }).sort(SORTS[sort]);
      grid.innerHTML = list.length ? list.map(function (p) { return PL.playerCard(p); }).join('')
        : '<p class="empty">No players match that search. Try a different name, or clear the filters.</p>';
      count.textContent = list.length + (list.length === 1 ? ' player' : ' players');
    }
    PL.$('#search').addEventListener('input', function (e) { query = e.target.value; draw(); });
    PL.$('#sort').addEventListener('change', function (e) { sort = e.target.value; draw(); });
    grid.addEventListener('click', function (e) {
      const b = e.target.closest('[data-player]'); if (b) openProfile(b.getAttribute('data-player'));
    });

    /* ---------- profile dialog ---------- */
    let openId = null;
    function openProfile(id) {
      const p = PL.playerById(id); if (!p) return;
      openId = id; renderProfile(p); PL.openDialog(dlg);
    }
    function renderProfile(p) {
      const ov = PL.overall(p), t = PL.tier(ov), s = PL.stats(p), r = p.record;
      const me = PL.getMe(), rated = PL.getRated();
      const canRate = me && me !== p.id && !rated[me + '>' + p.id];
      const alreadyRated = me && rated[me + '>' + p.id];
      body.innerHTML =
        '<header class="pf-head tier-' + t.id + '">' +
          '<div class="pf-av">' + PL.avatar(p) + '</div>' +
          '<div class="pf-id"><h2 id="pf-title">' + esc(p.tag) + '</h2>' +
            '<p class="pf-sub">' + esc(p.name) + ' \u00b7 ' + esc(p.country) + ' \u00b7 playing since ' + esc(p.since) + '</p>' +
            '<div class="chips"><span class="tag">' + esc(p.style) + '</span><span class="tag">' + esc(p.formation) + '</span><span class="tag">' + esc(p.club) + '</span></div></div>' +
          '<div class="pf-ovr"><b>' + ov + '</b><i>' + t.label + '</i></div>' +
        '</header>' +
        '<div class="pf-grid">' +
          '<section class="pf-box"><h3>Skill profile</h3>' + PL.radar(PL.ATTRS.map(function (a) { return p.attrs[a.k]; }), PL.ATTRS.map(function (a) { return a.short; }), 300) + '</section>' +
          '<section class="pf-box"><h3>FIFA 24 record</h3>' +
            '<div class="wdl" role="img" aria-label="' + r.w + ' wins, ' + r.d + ' draws, ' + r.l + ' losses"><span class="w" style="flex:' + r.w + '"></span><span class="d" style="flex:' + r.d + '"></span><span class="l" style="flex:' + r.l + '"></span></div>' +
            '<p class="wdl-key"><span class="k-w">' + r.w + ' wins</span><span class="k-d">' + r.d + ' draws</span><span class="k-l">' + r.l + ' losses</span></p>' +
            '<div class="numbers">' +
              num(r.p, 'Matches') + num(s.winPct + '%', 'Win rate') + num(s.gpg, 'Goals / game') +
              num(s.gapg, 'Conceded / game') + num((s.gd > 0 ? '+' : '') + s.gd, 'Goal difference') + num(s.csPct + '%', 'Clean sheets') +
            '</div>' +
            '<p class="form-row"><span>Last 5</span>' + p.form.map(function (f) { return '<b class="fp fp-' + f + '">' + f + '</b>'; }).join('') + '</p>' +
          '</section>' +
          '<section class="pf-box"><h3>Community ratings <small>(' + p.votes + ' votes)</small></h3>' +
            PL.RATING_KEYS.map(function (k) { return '<div class="rate-line"><span>' + k.label + '</span>' + PL.stars(p.ratings[k.k]) + '<b>' + p.ratings[k.k].toFixed(1) + '</b></div>'; }).join('') +
            rateBlock(p, me, canRate, alreadyRated) +
          '</section>' +
          '<section class="pf-box"><h3>About</h3><p>' + esc(p.bio || 'No bio yet.') + '</p>' +
            '<dl class="facts"><div><dt>Availability</dt><dd>' + esc(p.avail || 'Not set') + '</dd></div><div><dt>Favourite club</dt><dd>' + esc(p.club) + '</dd></div><div><dt>Formation</dt><dd>' + esc(p.formation) + '</dd></div></dl></section>' +
        '</div>' +
        '<footer class="pf-foot"><a class="btn" href="events.html?new=fc24">Schedule a match</a>' +
          (p.custom ? '<button type="button" class="btn btn-ghost" data-delete="' + esc(p.id) + '">Delete my profile</button>' : '') +
          '<button type="button" class="btn btn-ghost" data-close>Close</button></footer>';
      PL.$$('[data-close]', body).forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    }
    function num(v, label) { return '<div><b>' + esc(v) + '</b><span>' + label + '</span></div>'; }
    function rateBlock(p, me, canRate, already) {
      if (!me) return '<p class="hint">Pick who you are in the header (Playing as) or add your own profile to rate players.</p>';
      if (me === p.id) return '<p class="hint">This is you. Other players can rate your profile.</p>';
      if (already) return '<p class="hint">You have rated this player. Thanks!</p>';
      return '<div class="rate-form"><p class="hint">Rate ' + esc(p.tag) + ' (1 to 5):</p>' +
        PL.RATING_KEYS.map(function (k) {
          return '<div class="rate-pick" data-key="' + k.k + '"><span>' + k.label + '</span><span class="pick-stars">' +
            [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-val="' + n + '" aria-label="' + k.label + ' ' + n + ' stars">\u2605</button>'; }).join('') + '</span></div>';
        }).join('') + '<button type="button" class="btn btn-small" id="submit-rating" disabled>Submit rating</button></div>';
    }

    body.addEventListener('click', function (e) {
      const star = e.target.closest('.pick-stars button');
      if (star) {
        const row = star.closest('.rate-pick'), val = parseInt(star.getAttribute('data-val'), 10);
        row.setAttribute('data-picked', val);
        PL.$$('.pick-stars button', row).forEach(function (b) { b.classList.toggle('on', parseInt(b.getAttribute('data-val'), 10) <= val); });
        PL.$('#submit-rating', body).disabled = PL.$$('.rate-pick', body).some(function (r) { return !r.getAttribute('data-picked'); });
        return;
      }
      if (e.target.id === 'submit-rating') {
        const players = PL.getPlayers(), p = players.filter(function (x) { return x.id === openId; })[0], me = PL.getMe();
        if (!p || !me) return;
        PL.$$('.rate-pick', body).forEach(function (row) {
          const k = row.getAttribute('data-key'), v = parseInt(row.getAttribute('data-picked'), 10);
          p.ratings[k] = Math.round((p.ratings[k] * p.votes + v) / (p.votes + 1) * 100) / 100;
        });
        p.votes += 1; PL.savePlayers(players);
        const rated = PL.getRated(); rated[me + '>' + p.id] = true; PL.setRated(rated);
        renderProfile(p); draw(); PL.toast('Rating submitted');
        return;
      }
      const del = e.target.closest('[data-delete]');
      if (del && window.confirm('Delete this profile? Your event sign-ups will be removed too.')) {
        const id = del.getAttribute('data-delete');
        PL.savePlayers(PL.getPlayers().filter(function (x) { return x.id !== id; }));
        PL.saveEvents(PL.getEvents().map(function (ev) { ev.signups = ev.signups.filter(function (s) { return s !== id; }); return ev; }));
        if (PL.getMe() === null || PL.getMe() === id) PL.setMe(null);
        dlg.close(); PL.mountChrome(); draw(); PL.toast('Profile deleted');
      }
    });

    /* ---------- add profile ---------- */
    let photoData = null;
    const preview = PL.$('#photo-preview'), formError = PL.$('#form-error');
    const sliders = PL.$('#attr-sliders');
    sliders.innerHTML = PL.ATTRS.map(function (a) {
      return '<label class="slider"><span>' + a.label + ' <output id="o-' + a.k + '">60</output></span><input type="range" name="' + a.k + '" min="30" max="99" value="60"></label>';
    }).join('');
    function updateOverall() {
      const vals = PL.ATTRS.map(function (a) { return parseInt(form.elements[a.k].value, 10); });
      PL.ATTRS.forEach(function (a, i) { PL.$('#o-' + a.k).textContent = vals[i]; });
      const ov = Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length), t = PL.tier(ov);
      PL.$('#overall-preview').innerHTML = '<b>' + ov + '</b> <span class="tag">' + t.label + '</span>';
    }
    sliders.addEventListener('input', updateOverall);
    PL.$('#formation').innerHTML = PL.FORMATIONS.map(function (f) { return '<option>' + f + '</option>'; }).join('');
    PL.$('#style').innerHTML = PL.STYLES.map(function (f) { return '<option>' + f + '</option>'; }).join('');

    PL.$('#photo').addEventListener('change', function (e) {
      const f = e.target.files[0]; formError.hidden = true;
      if (!f) return;
      if (!/^image\//.test(f.type) || f.size > 8 * 1024 * 1024) { formError.textContent = 'Please choose an image file under 8 MB.'; formError.hidden = false; e.target.value = ''; return; }
      const fr = new FileReader();
      fr.onload = function () {
        const img = new Image();
        img.onload = function () {
          const s = Math.min(img.width, img.height), c = document.createElement('canvas');
          c.width = c.height = 256;
          c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
          photoData = c.toDataURL('image/jpeg', 0.82);
          preview.innerHTML = '<img class="av-img" src="' + photoData + '" alt="Profile picture preview">';
        };
        img.onerror = function () { formError.textContent = 'That image could not be read. Try a JPG or PNG.'; formError.hidden = false; };
        img.src = fr.result;
      };
      fr.readAsDataURL(f);
    });

    function openAdd() {
      form.reset(); photoData = null; formError.hidden = true;
      preview.innerHTML = '<span>No photo</span>';
      updateOverall(); PL.openDialog(addDlg);
    }
    PL.$$('[data-open-add]').forEach(function (b) { b.addEventListener('click', openAdd); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const f = form.elements, players = PL.getPlayers();
      const tag = f.tag.value.trim();
      const err = function (m) { formError.textContent = m; formError.hidden = false; formError.scrollIntoView({ block: 'nearest' }); };
      if (!/^[A-Za-z][A-Za-z0-9_-]{2,15}$/.test(tag)) return err('PSN ID must be 3 to 16 characters: letters, numbers, - or _, starting with a letter.');
      if (players.some(function (p) { return p.tag.toLowerCase() === tag.toLowerCase(); })) return err('That PSN ID is already on the site.');
      const P = parseInt(f.played.value, 10) || 0, W = parseInt(f.wins.value, 10) || 0, D = parseInt(f.draws.value, 10) || 0;
      const GF = parseInt(f.gf.value, 10) || 0, GA = parseInt(f.ga.value, 10) || 0, CS = parseInt(f.cs.value, 10) || 0;
      if (W + D > P) return err('Wins plus draws cannot be more than matches played.');
      if (CS > P) return err('Clean sheets cannot be more than matches played.');
      const attrs = {}; PL.ATTRS.forEach(function (a) { attrs[a.k] = parseInt(f[a.k].value, 10); });
      const ratings = {}; PL.RATING_KEYS.forEach(function (k) { ratings[k.k] = 3.5; });
      const np = {
        id: 'u' + Date.now().toString(36), tag: tag, name: f.name.value.trim() || tag, country: f.country.value.trim() || 'Unknown',
        club: f.club.value.trim() || 'Free agent', formation: f.formation.value, style: f.style.value,
        bio: f.bio.value.trim().slice(0, 240), avail: f.avail.value.trim().slice(0, 80), since: new Date().getFullYear(),
        photo: photoData, custom: true, attrs: attrs, ratings: ratings, votes: 0, form: [],
        record: { p: P, w: W, d: D, l: P - W - D, gf: GF, ga: GA, cs: CS }
      };
      players.push(np); PL.savePlayers(players); PL.setMe(np.id);
      addDlg.close(); PL.mountChrome(); draw(); openProfile(np.id);
      PL.toast('Welcome to the squad, ' + np.tag + '!');
    });

    document.addEventListener('pl:me', function () { if (dlg.open && openId) { const p = PL.playerById(openId); if (p) renderProfile(p); } });

    draw();
    const params = new URLSearchParams(window.location.search);
    if (params.get('p')) openProfile(params.get('p'));
    if (window.location.hash === '#new') openAdd();
  });
})();
