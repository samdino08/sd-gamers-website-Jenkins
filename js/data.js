/* ------------------------------------------------------------------
   PitchLine data. Edit this file to change the site name, the list of
   multiplayer games, and the demo players that appear on first visit.
------------------------------------------------------------------- */
window.PL = window.PL || {};

PL.SITE = {
  name: 'PitchLine',
  tagline: 'The PS4 football squad hub',
  flagship: 'fc24'
};

/* Multiplayer games shown on the site (all available on PS4).
   Player counts and modes are summaries; check the PlayStation Store for details. */
PL.GAMES = [
  { id: 'fc24', title: 'FIFA 24 (EA SPORTS FC 24)', short: 'FIFA 24', cat: 'Sports', hue: [150, 200], motif: 'ball',
    players: '1v1 online, or 11v11 in Pro Clubs', local: true,
    blurb: 'The main event here: Ultimate Team matches, Seasons, Pro Clubs and Friendlies with your squad.' },
  { id: 'rocketleague', title: 'Rocket League', short: 'Rocket League', cat: 'Sports', hue: [215, 275], motif: 'car',
    players: '1v1 to 4v4', local: true,
    blurb: 'Football with rocket-powered cars. Quick matches, big aerial goals.' },
  { id: 'fortnite', title: 'Fortnite', short: 'Fortnite', cat: 'Battle royale', hue: [265, 320], motif: 'storm',
    players: 'Up to 100 players', local: false,
    blurb: 'Drop in with friends, build, and be the last squad standing.' },
  { id: 'apex', title: 'Apex Legends', short: 'Apex', cat: 'Battle royale', hue: [8, 40], motif: 'hex',
    players: '60 players in squads of 3', local: false,
    blurb: 'Fast, team-based battle royale with a roster of unique legends.' },
  { id: 'mk11', title: 'Mortal Kombat 11', short: 'MK11', cat: 'Fighting', hue: [355, 25], motif: 'blades',
    players: '1v1', local: true,
    blurb: 'Head-to-head fighting with a cinematic look. Great for ladders and brackets.' },
  { id: 'overcooked2', title: 'Overcooked! 2', short: 'Overcooked 2', cat: 'Co-op & party', hue: [28, 55], motif: 'pot',
    players: 'Up to 4 players', local: true,
    blurb: 'Chaotic co-op cooking. The ultimate test of friendship between matches.' },
  { id: 'fallguys', title: 'Fall Guys', short: 'Fall Guys', cat: 'Co-op & party', hue: [300, 340], motif: 'bean',
    players: 'Up to 60 players', local: false,
    blurb: 'Silly obstacle-course knockout with dozens of players per round.' },
  { id: 'gtsport', title: 'Gran Turismo Sport', short: 'GT Sport', cat: 'Racing', hue: [195, 230], motif: 'track',
    players: 'Online lobbies and races', local: false,
    blurb: 'Sim-style racing with lobbies, daily races and custom rooms.' }
];

PL.MODES = {
  knockout: 'Knockout bracket',
  league: 'Round-robin league',
  teams: 'Team match',
  casual: 'Casual session'
};

PL.FORMATIONS = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '4-1-2-1-2', '5-3-2', '4-5-1'];
PL.STYLES = ['Playmaker', 'Attacker', 'Counter-attacker', 'Possession', 'Defender', 'Balanced'];

/* Demo players.  attrs = [Attack, Defence, Passing, Dribbling, Set pieces, Game IQ]
   ratings = community ratings [Skill, Sportsmanship, Teamwork, Reliability], out of 5 */
PL.SEED_PLAYERS = [
  { tag: 'NovaStrike_99', name: 'Marcus Lee', country: 'Canada', club: 'Real Madrid', formation: '4-2-3-1', style: 'Playmaker',
    attrs: [92, 74, 88, 90, 81, 89], p: 412, winPct: 65, drawPct: 12, gpg: 3.1, gapg: 1.5, cs: 120,
    ratings: [4.8, 4.5, 4.6, 4.9], votes: 64, form: 'WWWDW', since: 2019, avail: 'Weeknights, 8 to 11 pm ET',
    bio: 'Attack-first, always looking for the through ball. Runs a weekly knockout on Fridays.' },
  { tag: 'Kuro_Wall', name: 'Aiko Tanaka', country: 'Japan', club: 'Inter', formation: '5-3-2', style: 'Defender',
    attrs: [70, 93, 79, 72, 68, 90], p: 355, winPct: 61, drawPct: 18, gpg: 2.1, gapg: 0.9, cs: 171,
    ratings: [4.6, 4.9, 4.7, 4.8], votes: 51, form: 'WDWWW', since: 2020, avail: 'Weekends, all day JST',
    bio: 'Clean sheets are the goal. Patient, tidy, and very hard to break down.' },
  { tag: 'Vex_Roma', name: 'Luca Romano', country: 'Italy', club: 'AC Milan', formation: '4-3-3', style: 'Attacker',
    attrs: [90, 66, 81, 91, 76, 80], p: 298, winPct: 58, drawPct: 10, gpg: 3.4, gapg: 2.1, cs: 61,
    ratings: [4.4, 4.0, 4.2, 4.1], votes: 38, form: 'LWWWD', since: 2021, avail: 'Evenings CET',
    bio: 'Skill moves for days. If you leave space on the wing, he will find it.' },
  { tag: 'Ghost_Keeper', name: 'Tom Hughes', country: 'United Kingdom', club: 'Liverpool', formation: '4-4-2', style: 'Counter-attacker',
    attrs: [83, 82, 77, 79, 88, 85], p: 476, winPct: 60, drawPct: 14, gpg: 2.7, gapg: 1.2, cs: 149,
    ratings: [4.5, 4.7, 4.5, 4.6], votes: 72, form: 'WWLWW', since: 2018, avail: 'Weeknights, 9 pm GMT',
    bio: 'Set-piece specialist. Free kicks are a weapon, and yes, he practises them.' },
  { tag: 'Samba_Ray', name: 'Rafael Costa', country: 'Brazil', club: 'Barcelona', formation: '4-3-3', style: 'Possession',
    attrs: [84, 72, 91, 89, 74, 86], p: 331, winPct: 59, drawPct: 15, gpg: 2.8, gapg: 1.4, cs: 88,
    ratings: [4.6, 4.4, 4.5, 4.2], votes: 44, form: 'DWWWL', since: 2020, avail: 'Nights, BRT',
    bio: 'Keeps the ball and the tempo. Hates sitting deep.' },
  { tag: 'IronPaws', name: 'Priya Nair', country: 'India', club: 'Manchester City', formation: '4-1-2-1-2', style: 'Balanced',
    attrs: [79, 80, 83, 78, 72, 84], p: 224, winPct: 56, drawPct: 16, gpg: 2.4, gapg: 1.3, cs: 57,
    ratings: [4.3, 4.8, 4.9, 4.7], votes: 29, form: 'WLWDW', since: 2022, avail: 'Weekends IST',
    bio: 'Team player, great communicator. Loves Pro Clubs nights.' },
  { tag: 'Drift_King', name: 'Jonas Becker', country: 'Germany', club: 'Bayern Munich', formation: '3-5-2', style: 'Attacker',
    attrs: [86, 68, 74, 85, 79, 76], p: 267, winPct: 54, drawPct: 11, gpg: 3.0, gapg: 2.0, cs: 46,
    ratings: [4.1, 3.9, 4.0, 4.3], votes: 31, form: 'LWDWW', since: 2021, avail: 'Evenings CET',
    bio: 'Plays fast and loose. Also the one who suggests the Rocket League breaks.' },
  { tag: 'Pixel_Pele', name: 'Diego Alvarez', country: 'Argentina', club: 'Boca Juniors', formation: '4-4-2', style: 'Playmaker',
    attrs: [77, 63, 87, 82, 70, 79], p: 189, winPct: 52, drawPct: 17, gpg: 2.3, gapg: 1.6, cs: 34,
    ratings: [4.0, 4.6, 4.4, 3.9], votes: 22, form: 'WDLWW', since: 2022, avail: 'Late nights ART',
    bio: 'Vision over power. Still learning the meta, always up for a friendly.' },
  { tag: 'Zen_Striker', name: 'Amara Okafor', country: 'Nigeria', club: 'Arsenal', formation: '4-3-3', style: 'Counter-attacker',
    attrs: [81, 70, 72, 84, 66, 74], p: 152, winPct: 51, drawPct: 12, gpg: 2.6, gapg: 1.9, cs: 24,
    ratings: [3.9, 4.5, 4.3, 4.4], votes: 17, form: 'LWWLW', since: 2023, avail: 'Weekends WAT',
    bio: 'Pace merchant. Rising fast through the divisions.' },
  { tag: 'Blaze_Vega', name: 'Sofia Vega', country: 'Spain', club: 'Atletico Madrid', formation: '5-3-2', style: 'Defender',
    attrs: [64, 84, 70, 66, 63, 78], p: 203, winPct: 50, drawPct: 22, gpg: 1.6, gapg: 1.0, cs: 71,
    ratings: [3.8, 4.7, 4.5, 4.6], votes: 20, form: 'DWDLW', since: 2022, avail: 'Weeknights CET',
    bio: 'Low block, sharp counters. 1-0 wins are her favourite kind.' },
  { tag: 'Maple_Ace', name: 'Ethan Clarke', country: 'Canada', club: 'Toronto FC', formation: '4-2-3-1', style: 'Balanced',
    attrs: [68, 66, 71, 65, 62, 70], p: 96, winPct: 47, drawPct: 14, gpg: 2.0, gapg: 1.9, cs: 12,
    ratings: [3.5, 4.6, 4.4, 4.5], votes: 9, form: 'LDWLW', since: 2024, avail: 'Weekends ET',
    bio: 'New to the scene and keen to learn. Great sport.' },
  { tag: 'Rookie_Rin', name: 'Rin Park', country: 'South Korea', club: 'Tottenham', formation: '4-4-2', style: 'Attacker',
    attrs: [62, 55, 60, 68, 58, 57], p: 48, winPct: 42, drawPct: 10, gpg: 1.9, gapg: 2.3, cs: 4,
    ratings: [3.2, 4.3, 4.0, 4.2], votes: 5, form: 'LLWDL', since: 2024, avail: 'Nights KST',
    bio: 'Just started competing. Looking for friendly matches to improve.' }
];
