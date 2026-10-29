# C64 RPG development player changelog

## 0.1.5 — 2026-10-28

- Update the player script cache key so the corrected Moon Moth filename and labels are used.
- Fix Moon Moth v0.1.1: rename the star counter from reserved C64 status variable ST to LC, resolving SYNTAX ERROR IN 1000.
- Correct the shadow screen code to display X and use a versioned PRG URL to avoid cached broken builds.

## 0.1.4 — 2026-10-28

- Add Moon Moth v0.1.0, an original C64 BASIC game: collect moonlight through three wrapping gardens and avoid turn-based shadows.
- Include original BASIC source, compiled PRG and direct game-selection links.
- Keep previous archived builds unchanged.

## 2026-10-28 — Project page

- Add C64 Lab to the main collection under In development, with an internal project page, icon and link to this player.
- Player remains v0.1.3; no game code or player behavior changes.

## 0.1.3 — 2026-10-28

- Version player script and stylesheet URLs so updated HTML loads the matching startup code.

## 0.1.2 — 2026-10-28

- Serve the player from /c64-rpg-dev/ after the nested development route returned 404.
- Load system firmware and wait for a running C64 before inserting the game program.

## 0.1.1 — 2026-10-28

- Added a Return touch key for INPUT prompts.
- Emit touch keys directly, including Space, rather than trimming them through the action parser.
- Give every launch a unique iframe URL so switching and restarting creates a fresh emulator.

## 0.1.0 — 2026-10-28

- Added GitHub Pages development launcher for Velora full prototype, map test, Asterra test slice, GORK 1 and visibility v3.
- Added restart, sound, full keyboard, full screen and touch controls.
- Added standard C64 firmware loading rather than relying on the incomplete Open ROM BASIC implementation.
- Added file loading errors, emulator timeout and download fallback.
- Original game code unchanged. This version number belongs to the browser player.
