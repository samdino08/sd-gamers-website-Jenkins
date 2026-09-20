/* ------------------------------------------------------------------
   PitchLine data. Edit this file to change the site name, the list of
   multiplayer games, and the demo players that appear on first visit.
------------------------------------------------------------------- */
window.PL = window.PL || {};

/* 1) SITE NAME: change 'name' and it updates the header, footer, page titles and calendar files. */
PL.SITE = {
  name: 'Gamers Gangbang',
  tagline: 'The PS4 football squad hub',
  flagship: 'fc24'
};

/* 2) HOMEPAGE CONTENT: edit any text below and save. Leave a value as '' or null to keep the default. */
PL.HOME = {
  heroTitle: 'Get ready for gangbang on the game night!!',
  heroLead: 'Build a FIFA 24 player profile with real stats and community ratings, schedule match nights for the whole squad, and find the best multiplayer games on PS4.',
  primaryButton: { text: 'Create your profile', href: 'players.html#new' },
  secondaryButton: { text: 'See upcoming events', href: 'events.html' },
  topPlayersTitle: 'Top rated players',
  topPlayersCount: 4,                  // how many player cards to show
  heroPlayer: null,                    // PSN ID to feature in the big card, e.g. 'Kuro_Wall' (null = top rated)
  eventsTitle: 'Next match nights',
  gamesTitle: 'Multiplayer on PS4',
  featuredGames: ['fc24', 'rocketleague', 'fortnite', 'apex'],   // game ids from the list below
  ctaTitle: 'Ready for your first match night?',
  ctaText: 'Add your profile in a minute, pick a game, and invite the squad.',
  ctaButton: 'Join the squad',
  // The three counters normally count the real data. Put a number here to override one.
  stats: { players: null, events: null, matches: null }
};

/* 3) PROFILE PICTURES: put image files in the images/players/ folder, then set 'photo' on a player below,
      for example  photo: 'images/players/novastrike.jpg'.  Leave photo: '' to use the generated avatar. */

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
  { tag: 'Abhi', photo: 'images/players/abhi.jpg', name: 'Abhi', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' },
  { tag: 'Gurpal', photo: 'images/players/gurpal.jpg', name: 'Gurpal', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' },
  { tag: 'Sam_Dino', photo: 'images/players/sam_dino.jpg', name: 'Sam Dino', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' },
  { tag: 'Glenn', photo: 'images/players/glenn.jpg', name: 'Glenn', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' },
  { tag: 'Akshat', photo: 'images/players/akshat.jpg', name: 'Akshat', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' },
  { tag: 'Bhavya', photo: 'images/players/bhavya.jpg', name: 'Bhavya', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' },
  { tag: 'Ben', photo: 'images/players/ben.jpg', name: 'Ben', country: 'Not set', club: 'Free agent', formation: '4-3-3', style: 'Balanced',
    attrs: [65, 65, 65, 65, 65, 65], p: 10, winPct: 50, drawPct: 20, gpg: 2.0, gapg: 2.0, cs: 1,
    ratings: [3.5, 3.5, 3.5, 3.5], votes: 0, form: '', since: 2024, avail: 'Not set',
    bio: 'New to the squad.' }
  /* To add another player, put a comma after the last } and copy a block. */
];
