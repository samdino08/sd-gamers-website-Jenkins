# PitchLine: PS4 football squad hub

A high-graphics static website for a FIFA 24 (EA SPORTS FC 24) community on PS4.

## Pages
- `index.html`: animated hero, top-rated players, next events, games
- `players.html`: searchable/sortable player cards, full profiles (radar chart, record, community ratings), add-your-profile form with photo upload
- `events.html`: event list, month calendar, join/leave, create event, bracket/team balancing, add-to-calendar (.ics)
- `games.html`: multiplayer PS4 games with filters and "schedule an event" links

## Edit these files
- `js/data.js`: site name, game list, demo players
- `css/style.css`: colours and fonts (see `:root`)

## Important: how data is stored
This is a static site (no server database). Profiles, ratings, events and sign-ups are saved in the
visitor's own browser (localStorage), so each visitor sees the demo data plus their own changes.
For a shared community (everyone sees the same players and events) you need a small backend
(for example Node.js + a database) behind an API. The front-end here is ready to be connected to one.

## Deploy
Push to `main`; Jenkins runs the `Jenkinsfile` and syncs the site to the web server.
