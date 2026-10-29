# C64 RPG development player changelog

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
