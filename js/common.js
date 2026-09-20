(function () {
  'use strict';
  const PL = window.PL;

  /* ============ storage (localStorage, with in-memory fallback) ============ */
  const KEY = {
    players: 'pitchline-v1-players',
    events: 'pitchline-v1-events',
    me: 'pitchline-v1-me',
    rated: 'pitchline-v1-rated'
  };
  const mem = {};
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) { /* storage blocked */ }
    return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : fallback;
  }
  function write(key, value) {
    mem[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { PL.storageBlocked = true; }
  }
  PL.resetData = function () {
    Object.keys(KEY).forEach(function (k) { try { localStorage.removeItem(KEY[k]); } catch (e) { /* ignore */ } delete mem[KEY[k]]; });
  };

  /* ============ small helpers ============ */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  PL.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };
  PL.clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };
  PL.$ = function (sel, root) { return (root || document).querySelector(sel); };
  PL.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  PL.reduceMotion = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  PL.fmtWhen = function (ts) {
    return new Date(ts).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };
  PL.fmtDay = function (ts) {
    return new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };
  PL.fmtTime = function (ts) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };
  PL.countdown = function (e) {
    const now = Date.now(), end = e.start + e.duration * 60000;
    if (now > end) return 'Finished';
    if (now >= e.start) return 'Live now';
    const m = Math.floor((e.start - now) / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    if (d > 0) return 'Starts in ' + d + 'd ' + h + 'h';
    if (h > 0) return 'Starts in ' + h + 'h ' + (m % 60) + 'm';
    return 'Starts in ' + m + 'm';
  };

  /* ============ players ============ */
  PL.ATTRS = [
    { k: 'atk', label: 'Attack', short: 'ATK' },
    { k: 'def', label: 'Defence', short: 'DEF' },
    { k: 'pas', label: 'Passing', short: 'PAS' },
    { k: 'drb', label: 'Dribbling', short: 'DRI' },
    { k: 'set', label: 'Set pieces', short: 'SET' },
    { k: 'iq', label: 'Game IQ', short: 'IQ' }
  ];
  PL.RATING_KEYS = [
    { k: 'skill', label: 'Skill' },
    { k: 'sport', label: 'Sportsmanship' },
    { k: 'team', label: 'Teamwork' },
    { k: 'rel', label: 'Reliability' }
  ];

  function seedPlayers() {
    return PL.SEED_PLAYERS.map(function (s, i) {
      const w = Math.round(s.p * s.winPct / 100), d = Math.round(s.p * s.drawPct / 100);
      const attrs = {}; PL.ATTRS.forEach(function (a, j) { attrs[a.k] = s.attrs[j]; });
      const ratings = {}; PL.RATING_KEYS.forEach(function (r, j) { ratings[r.k] = s.ratings[j]; });
      return {
        id: 'p' + (i + 1), tag: s.tag, name: s.name, country: s.country, club: s.club, formation: s.formation,
        style: s.style, bio: s.bio, avail: s.avail, since: s.since, photo: s.photo || null, custom: false,
        attrs: attrs, ratings: ratings, votes: s.votes, form: s.form.split(''),
        record: { p: s.p, w: w, d: d, l: s.p - w - d, gf: Math.round(s.gpg * s.p), ga: Math.round(s.gapg * s.p), cs: s.cs }
      };
    });
  }
  /* Keep saved demo players in step with js/data.js (names, photos, stats), but keep any
     community ratings visitors have added and keep every profile visitors created. */
  const SYNC_FIELDS = ['tag', 'name', 'country', 'club', 'formation', 'style', 'bio', 'avail', 'since', 'photo', 'attrs', 'record', 'form'];
  let synced = false;
  function syncSeeds(list) {
    const seeds = seedPlayers(), seedIds = {}, byId = {};
    list.forEach(function (p) { byId[p.id] = p; });
    seeds.forEach(function (s) {
      seedIds[s.id] = true;
      const cur = byId[s.id];
      if (!cur) { list.push(s); return; }
      if (cur.custom) return;
      SYNC_FIELDS.forEach(function (k) { cur[k] = s[k]; });
      if (!(cur.votes > s.votes)) { cur.ratings = s.ratings; cur.votes = s.votes; }
    });
    return list.filter(function (p) { return p.custom || seedIds[p.id]; });
  }
  PL.getPlayers = function () {
    let list = read(KEY.players, null);
    if (!Array.isArray(list) || !list.length) { list = seedPlayers(); synced = true; write(KEY.players, list); }
    else if (!synced) { list = syncSeeds(list); synced = true; write(KEY.players, list); }
    return list;
  };
  PL.savePlayers = function (list) { write(KEY.players, list); };
  PL.playerById = function (id) { return PL.getPlayers().filter(function (p) { return p.id === id; })[0] || null; };
  PL.getMe = function () {
    const id = read(KEY.me, null);
    return id && PL.playerById(id) ? id : null;
  };
  PL.setMe = function (id) { write(KEY.me, id); };
  PL.getRated = function () { return read(KEY.rated, {}); };
  PL.setRated = function (o) { write(KEY.rated, o); };

  PL.overall = function (p) {
    return Math.round(PL.ATTRS.reduce(function (s, a) { return s + p.attrs[a.k]; }, 0) / PL.ATTRS.length);
  };
  PL.tier = function (ov) {
    if (ov >= 85) return { id: 'gold', label: 'Gold' };
    if (ov >= 75) return { id: 'silver', label: 'Silver' };
    return { id: 'bronze', label: 'Bronze' };
  };
  PL.stats = function (p) {
    const r = p.record, played = Math.max(r.p, 1);
    return {
      winPct: Math.round(r.w / played * 100),
      drawPct: Math.round(r.d / played * 100),
      lossPct: Math.round(r.l / played * 100),
      gpg: (r.gf / played).toFixed(1),
      gapg: (r.ga / played).toFixed(1),
      gd: r.gf - r.ga,
      csPct: Math.round(r.cs / played * 100)
    };
  };
  PL.avgRating = function (p) {
    return PL.RATING_KEYS.reduce(function (s, r) { return s + p.ratings[r.k]; }, 0) / PL.RATING_KEYS.length;
  };

  /* ============ events ============ */
  PL.game = function (id) { return PL.GAMES.filter(function (g) { return g.id === id; })[0] || PL.GAMES[0]; };

  function at(dayOffset, hour, minute) {
    const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hour, minute || 0, 0, 0); return d.getTime();
  }
  function ids(list) { return list.map(function (i) { return 'p' + i; }); }
  function seedEvents() {
    return [
      { id: 'e1', title: 'Friday Night Knockout', game: 'fc24', mode: 'knockout', start: at(2, 20, 0), duration: 120, max: 16,
        host: 'p1', signups: ids([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
        desc: 'Single-elimination FIFA 24 bracket. Seeded by rating. Bring your best 11 and your best sportsmanship.' },
      { id: 'e2', title: 'Weekend League Warm-up', game: 'fc24', mode: 'league', start: at(1, 21, 0), duration: 90, max: 10,
        host: 'p4', signups: ids([4, 1, 5, 7, 8, 9, 3]),
        desc: 'Round-robin warm-up matches before the weekend. Short halves, no pressure.' },
      { id: 'e3', title: 'Pro Clubs Practice: 11v11', game: 'fc24', mode: 'teams', start: at(4, 19, 30), duration: 120, max: 22,
        host: 'p6', signups: ids([6, 2, 10, 5, 9, 12, 8]),
        desc: 'Team practice for Pro Clubs. Teams are balanced automatically by rating.' },
      { id: 'e4', title: 'Rocket League 3v3 Night', game: 'rocketleague', mode: 'teams', start: at(3, 21, 0), duration: 90, max: 12,
        host: 'p7', signups: ids([7, 1, 3, 9, 11]),
        desc: 'A break from football with rocket-powered cars. All skill levels welcome.' },
      { id: 'e5', title: 'Mortal Kombat Ladder', game: 'mk11', mode: 'knockout', start: at(8, 20, 30), duration: 90, max: 8,
        host: 'p3', signups: ids([3, 7, 1, 4, 5, 8, 9, 11]),
        desc: 'Best-of-three bracket. Full, but you can leave to open a spot for a friend.' },
      { id: 'e6', title: 'Fall Guys Party Sunday', game: 'fallguys', mode: 'casual', start: at(6, 18, 0), duration: 60, max: 60,
        host: 'p6', signups: ids([6, 10, 12, 9, 2]),
        desc: 'Relaxed party session. Join a lobby together and cheer each other on.' },
      { id: 'e7', title: 'Season Opener Cup', game: 'fc24', mode: 'knockout', start: at(-3, 20, 0), duration: 120, max: 8,
        host: 'p1', signups: ids([1, 2, 3, 4, 5, 6, 7, 8]),
        desc: 'Last week\u2019s cup. Thanks to everyone who played.' }
    ];
  }
  PL.getEvents = function () {
    let list = read(KEY.events, null);
    if (!Array.isArray(list) || !list.length) { list = seedEvents(); write(KEY.events, list); }
    return list;
  };
  PL.saveEvents = function (list) { write(KEY.events, list); };
  PL.eventState = function (e) {
    const now = Date.now(), end = e.start + e.duration * 60000;
    if (now > end) return 'past';
    if (now >= e.start) return 'live';
    return e.signups.length >= e.max ? 'full' : 'open';
  };

  /* ============ avatars ============ */
  let avSeq = 0;
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function safePhoto(src) {
    src = String(src || '');
    if (src.indexOf('data:image/') === 0) return src;
    return src.indexOf('..') === -1 && /^images\/[\w\-. ()\/]+\.(png|jpe?g|webp|gif|svg|avif)$/i.test(src) ? encodeURI(src) : '';
  }
  PL.avatar = function (p) {
    const photo = safePhoto(p.photo);
    const svg = PL.avatarSVG(p);
    if (!photo) return svg;
    return '<span class="av-stack">' + svg + '<img class="av-img av-over" src="' + photo + '" alt="" onerror="this.remove()"></span>';
  };
  PL.avatarSVG = function (p) {
    const h = hash(p.tag), h1 = h % 360, h2 = (h1 + 50 + (h >>> 8) % 90) % 360, v = (h >>> 4) % 3, id = 'av' + (++avSeq);
    const glow = 'hsl(' + h2 + ',100%,68%)';
    let visor;
    if (v === 0) visor = '<rect x="33" y="37" width="34" height="15" rx="7.5" fill="' + glow + '" fill-opacity=".25"/><rect x="35" y="39" width="30" height="11" rx="5.5" fill="' + glow + '"/>';
    else if (v === 1) visor = '<ellipse cx="42" cy="45" rx="5.5" ry="6.5" fill="' + glow + '"/><ellipse cx="58" cy="45" rx="5.5" ry="6.5" fill="' + glow + '"/>';
    else visor = '<path d="M33 40 Q50 33 67 40 L64 52 Q50 57 36 52Z" fill="' + glow + '"/>';
    return '<svg class="av-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<defs><radialGradient id="' + id + '" cx="50%" cy="28%" r="95%"><stop offset="0" stop-color="hsl(' + h1 + ',75%,52%)"/><stop offset="1" stop-color="hsl(' + h2 + ',65%,13%)"/></radialGradient></defs>' +
      '<rect width="100" height="100" fill="url(#' + id + ')"/>' +
      '<circle cx="50" cy="50" r="36" fill="none" stroke="hsl(' + h1 + ',90%,75%)" stroke-opacity=".22"/>' +
      '<path d="M8 100 C10 76 30 70 50 70 C70 70 90 76 92 100Z" fill="hsl(' + h1 + ',30%,11%)"/>' +
      '<path d="M37 73 L50 86 L63 73" fill="none" stroke="' + glow + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="27" cy="46" r="5.5" fill="hsl(' + h1 + ',22%,15%)"/><circle cx="73" cy="46" r="5.5" fill="hsl(' + h1 + ',22%,15%)"/>' +
      '<rect x="29" y="19" width="42" height="49" rx="19" fill="hsl(' + h1 + ',22%,19%)" stroke="hsl(' + h1 + ',40%,45%)" stroke-opacity=".6"/>' +
      '<path d="M40 24 Q50 20 60 24" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/>' +
      visor + '</svg>';
  };

  /* ============ charts ============ */
  PL.radar = function (values, labels, size) {
    size = size || 300;
    const c = size / 2, r = size * 0.32, n = values.length;
    function pt(i, f) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f]; }
    const ring = function (f) { return '<polygon class="radar-ring" points="' + values.map(function (_, i) { return pt(i, f).map(function (x) { return x.toFixed(1); }).join(','); }).join(' ') + '"/>'; };
    const axes = values.map(function (_, i) { const q = pt(i, 1); return '<line class="radar-axis" x1="' + c + '" y1="' + c + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '"/>'; }).join('');
    const shape = values.map(function (v, i) { return pt(i, v / 100).map(function (x) { return x.toFixed(1); }).join(','); }).join(' ');
    const dots = values.map(function (v, i) { const q = pt(i, v / 100); return '<circle class="radar-dot" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="3.5"/>'; }).join('');
    const text = values.map(function (v, i) {
      const q = pt(i, 1.3), a = -Math.PI / 2 + i * 2 * Math.PI / n, cs = Math.cos(a);
      const anchor = cs > 0.3 ? 'start' : (cs < -0.3 ? 'end' : 'middle');
      return '<text class="radar-label" x="' + q[0].toFixed(1) + '" y="' + q[1].toFixed(1) + '" text-anchor="' + anchor + '"><tspan>' + labels[i] + '</tspan><tspan class="radar-val" x="' + q[0].toFixed(1) + '" dy="15">' + v + '</tspan></text>';
    }).join('');
    return '<svg class="radar" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Skill radar chart">' +
      ring(1 / 3) + ring(2 / 3) + ring(1) + axes +
      '<polygon class="radar-shape" points="' + shape + '"/>' + dots + text + '</svg>';
  };
  PL.stars = function (v) {
    return '<span class="stars" style="--v:' + (v / 5 * 100).toFixed(0) + '%" role="img" aria-label="' + v.toFixed(1) + ' out of 5">\u2605\u2605\u2605\u2605\u2605</span>';
  };

  /* ============ game art (generated, no image files) ============ */
  const MOTIFS = {
    ball: '<circle cx="100" cy="60" r="38"/><polygon points="100,44 115,55 109,73 91,73 85,55"/><path d="M100 44 V22 M115 55 L136 48 M109 73 L122 91 M91 73 L78 91 M85 55 L64 48"/>',
    car: '<path d="M40 78 L52 58 Q56 52 64 52 H112 Q122 52 128 60 L142 74 Q150 78 150 84 V90 H40Z"/><circle cx="68" cy="92" r="13"/><circle cx="126" cy="92" r="13"/><circle cx="168" cy="40" r="14"/>',
    storm: '<circle cx="100" cy="60" r="48"/><circle cx="100" cy="60" r="32"/><circle cx="100" cy="60" r="16"/><circle cx="100" cy="60" r="3"/><path d="M100 6 V20 M100 100 V114 M46 60 H60 M140 60 H154"/>',
    hex: '<polygon points="100,12 148,38 148,86 100,112 52,86 52,38"/><polygon points="100,34 130,50 130,80 100,96 70,80 70,50"/><polygon points="100,54 112,60 112,72 100,78 88,72 88,60"/>',
    blades: '<path d="M52 100 L136 20 L146 30 L62 110Z"/><path d="M148 100 L64 20 L54 30 L138 110Z"/><circle cx="100" cy="60" r="10"/>',
    pot: '<path d="M52 56 H148 V88 Q148 102 134 102 H66 Q52 102 52 88Z"/><path d="M52 62 H36 M148 62 H164"/><path d="M76 44 Q70 34 76 26 M100 44 Q94 32 100 22 M124 44 Q118 34 124 26"/>',
    bean: '<path d="M64 96 V56 Q64 24 100 24 Q136 24 136 56 V96 Q136 104 128 104 H72 Q64 104 64 96Z"/><circle cx="86" cy="52" r="8"/><circle cx="114" cy="52" r="8"/>',
    track: '<path d="M30 92 C50 20 96 20 110 60 C120 88 156 94 172 44"/><path d="M30 104 C54 34 92 34 104 68 C118 100 160 108 182 50" stroke-dasharray="6 6"/><circle cx="172" cy="44" r="6"/>'
  };
  PL.gameArt = function (g) {
    const id = 'ga-' + g.id;
    return '<svg class="game-svg" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + g.hue[0] + ',75%,42%)"/><stop offset="1" stop-color="hsl(' + g.hue[1] + ',70%,14%)"/></linearGradient>' +
      '<radialGradient id="' + id + 'g" cx="30%" cy="20%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="200" height="120" fill="url(#' + id + ')"/><rect width="200" height="120" fill="url(#' + id + 'g)"/>' +
      '<g fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.75)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">' + MOTIFS[g.motif] + '</g></svg>';
  };
  PL.gameCard = function (g, extra) {
    return '<article class="game-card tilt">' +
      '<div class="game-art">' + PL.gameArt(g) + '<span class="game-cat">' + PL.esc(g.cat) + '</span></div>' +
      '<div class="game-body"><h3>' + PL.esc(g.title) + '</h3>' +
      '<p class="game-players">' + PL.esc(g.players) + '</p>' +
      '<p class="game-blurb">' + PL.esc(g.blurb) + '</p>' +
      '<div class="chips"><span class="tag">Online multiplayer</span>' + (g.local ? '<span class="tag">Couch play</span>' : '') + '</div>' +
      (extra || '') + '</div></article>';
  };

  /* ============ player card ============ */
  PL.playerCard = function (p, big) {
    const ov = PL.overall(p), t = PL.tier(ov), s = PL.stats(p);
    return '<button type="button" class="pcard tilt tier-' + t.id + (big ? ' pcard-big' : '') + '" data-player="' + PL.esc(p.id) + '" aria-label="Open ' + PL.esc(p.tag) + ' profile, rating ' + ov + '">' +
      '<span class="pc-top"><span class="pc-ovr"><b>' + ov + '</b><i>' + t.label + '</i></span>' +
      '<span class="pc-av">' + PL.avatar(p) + '</span></span>' +
      '<span class="pc-name">' + PL.esc(p.tag) + '</span>' +
      '<span class="pc-sub">' + PL.esc(p.country) + ' \u00b7 ' + PL.esc(p.style) + '</span>' +
      '<span class="pc-stats">' + PL.ATTRS.map(function (a) { return '<span><em>' + a.short + '</em><b>' + p.attrs[a.k] + '</b></span>'; }).join('') + '</span>' +
      '<span class="pc-foot"><span>' + s.winPct + '% wins</span><span>' + p.record.p + ' matches</span></span></button>';
  };

  /* ============ UI helpers ============ */
  let toastTimer;
  PL.toast = function (msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };
  PL.wireDialog = function (dlg) {
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    PL.$$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
  };
  PL.openDialog = function (dlg) {
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else { dlg.setAttribute('open', ''); }
  };

  /* Pointer-driven tilt + sheen on any .tilt element */
  PL.enableTilt = function () {
    if (PL.reduceMotion() || !window.matchMedia('(hover: hover)').matches) return;
    document.addEventListener('pointermove', function (e) {
      const el = e.target.closest ? e.target.closest('.tilt') : null;
      if (!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    document.addEventListener('pointerout', function (e) {
      const el = e.target.closest ? e.target.closest('.tilt') : null;
      if (el && !el.contains(e.relatedTarget)) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    });
  };

  PL.animateCounters = function (root) {
    const els = PL.$$('[data-count]', root);
    function run(el) {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (PL.reduceMotion()) { el.textContent = target.toLocaleString(); return; }
      const t0 = performance.now(), dur = 1100;
      (function tick(now) {
        const f = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - f, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (f < 1) requestAnimationFrame(tick);
      })(t0);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  };

  /* ============ hero canvas: floodlights, drifting sparks, pitch lines ============ */
  PL.heroCanvas = function (canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, parts = [], raf = 0, visible = true;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(24, Math.round(w * h / 16000));
      parts = [];
      for (let i = 0; i < n; i++) parts.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.4, s: Math.random() * 0.25 + 0.06, a: Math.random() * 0.6 + 0.2 });
    }
    function beam(x0, angle, spread, alpha) {
      const len = h * 1.25, g = ctx.createLinearGradient(x0, 0, x0 + Math.sin(angle) * len, Math.cos(angle) * len);
      g.addColorStop(0, 'rgba(160,215,255,' + alpha + ')'); g.addColorStop(1, 'rgba(160,215,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, -10);
      ctx.lineTo(x0 + Math.sin(angle - spread) * len, Math.cos(angle - spread) * len);
      ctx.lineTo(x0 + Math.sin(angle + spread) * len, Math.cos(angle + spread) * len);
      ctx.closePath(); ctx.fill();
    }
    function pitch(t) {
      const horizon = h * 0.6, vx = w * 0.5;
      ctx.strokeStyle = 'rgba(120,220,255,0.55)'; ctx.lineWidth = 1;
      ctx.globalAlpha = 0.22;
      for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(vx + i * w * 0.02, horizon); ctx.lineTo(vx + i * w * 0.17, h); ctx.stroke(); }
      for (let k = 0; k < 9; k++) {
        const f = ((k + t * 0.0003) % 9) / 9, y = horizon + (h - horizon) * f * f;
        ctx.globalAlpha = 0.08 + f * 0.3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.ellipse(vx, horizon + (h - horizon) * 0.62, w * 0.16, (h - horizon) * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const sway = Math.sin(t * 0.00035) * 0.06;
      beam(w * 0.12, -0.32 + sway, 0.11, 0.22);
      beam(w * 0.88, 0.32 - sway, 0.11, 0.22);
      beam(w * 0.5, Math.sin(t * 0.0002) * 0.12, 0.07, 0.10);
      pitch(t);
      for (let i = 0; i < parts.length; i++) {
        const q = parts[i]; q.y -= q.s; q.x += Math.sin((t * 0.0004) + i) * 0.12;
        if (q.y < -4) { q.y = h + 4; q.x = Math.random() * w; }
        ctx.fillStyle = 'rgba(190,230,255,' + q.a + ')'; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    function loop(t) { if (visible) draw(t); raf = requestAnimationFrame(loop); }
    resize(); draw(0);
    window.addEventListener('resize', function () { resize(); draw(performance.now()); });
    if (PL.reduceMotion()) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
    }
    raf = requestAnimationFrame(loop);
  };

  /* ============ header / footer ============ */
  PL.mountChrome = function () {
    const page = document.body.getAttribute('data-page') || '';
    const pageTitle = document.body.getAttribute('data-title');
    document.title = pageTitle ? pageTitle + ' - ' + PL.SITE.name : PL.SITE.name + ' - ' + PL.SITE.tagline;
    function link(href, key, label) { return '<a href="' + href + '"' + (page === key ? ' aria-current="page"' : '') + '>' + label + '</a>'; }
    const hd = document.getElementById('site-header');
    if (hd) hd.innerHTML =
      '<div class="container bar"><a class="brand" href="index.html" aria-label="' + PL.esc(PL.SITE.name) + ' home">' +
      '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><polygon points="16,10 21,13.5 19,19.5 13,19.5 11,13.5" fill="currentColor"/></svg>' +
      '<span>' + PL.esc(PL.SITE.name) + '</span></a>' +
      '<nav aria-label="Main">' + link('index.html', 'home', 'Home') + link('players.html', 'players', 'Players') + link('events.html', 'events', 'Events') + link('games.html', 'games', 'Games') + '</nav>' +
      '<label class="me-pick"><span>Playing as</span><select id="me-select" aria-label="Playing as"></select></label>' +
      '<a class="btn btn-small" href="players.html#new">Join the squad</a></div>';
    const sel = document.getElementById('me-select');
    if (sel) {
      const me = PL.getMe();
      sel.innerHTML = '<option value="">Choose profile</option>' + PL.getPlayers().map(function (p) {
        return '<option value="' + PL.esc(p.id) + '"' + (p.id === me ? ' selected' : '') + '>' + PL.esc(p.tag) + '</option>';
      }).join('');
      sel.addEventListener('change', function () {
        PL.setMe(sel.value || null);
        if (sel.value) PL.toast('You are now playing as ' + PL.playerById(sel.value).tag);
        document.dispatchEvent(new CustomEvent('pl:me'));
      });
    }
    const ft = document.getElementById('site-footer');
    if (ft) ft.innerHTML =
      '<div class="container foot"><p>&copy; ' + new Date().getFullYear() + ' ' + PL.esc(PL.SITE.name) + '. A fan community site, not affiliated with EA, Sony or any game publisher. Game names belong to their owners.</p>' +
      '<p class="foot-note">Demo mode: profiles and events are saved in this browser only. <button type="button" class="linkbtn" id="reset-demo">Reset demo data</button></p></div>';
    const rb = document.getElementById('reset-demo');
    if (rb) rb.addEventListener('click', function () {
      if (window.confirm('Reset all demo data (profiles, events, sign-ups) in this browser?')) { PL.resetData(); window.location.reload(); }
    });
  };

  document.addEventListener('DOMContentLoaded', function () { PL.mountChrome(); PL.enableTilt(); });
})();
