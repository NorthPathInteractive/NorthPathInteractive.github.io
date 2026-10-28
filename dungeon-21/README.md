# Dungeon 21

Playable blackjack RPG demo, v0.3.0. In development.

Open index.html in a browser or serve this repository as a static website. No install or build step required. Game rules and controls are in the game’s How to play panel. Progress is stored locally in your browser; New Run resets it.

Pixel art, icon, UI and game code created for North Path Interactive. No external assets or dependencies.

## v0.2.0 — Pocket soundtrack

Original synthesized title, eerie exploration and battle themes, monster victory and dungeon-clear fanfares, a defeat cue, and card, hit, hurt, healing and treasure effects. Power On unlocks audio and plays title music; Start Adventure or Continue Run enters the dungeon. Play Silently bypasses audio. Sound mutes music and effects together; leaving the tab pauses audio. Saved v0.1.0 runs remain compatible. No external assets or dependencies.

## v0.3.0 — Endless gold runs

- Start with 10 health and 20 gold. No final boss or run victory screen.
- Every hand deducts an ante. The monster matches it: winning returns twice the ante, ties refund it, and losses cost the ante and health. Kill bonuses are replaced by per-hand winnings.
- A run ends at zero health or when the next ante cannot be paid. Remaining gold is the final score.
- Repeating monster types have increasing levels, stakes, endurance and playing rules. Level 1 stands on 12+, level 2 on 15+, level 3 on 17+, and higher levels adapt to the player's first card.
- Chests drop gold or stackable Identify potions. Using one reveals that type and level for the rest of the run. New runs reset that knowledge.
- Initials and the local top 10 are saved in browser storage. No server or shared leaderboard.
- New rules use dungeon21-v2 saves; earlier saves remain untouched under dungeon21-v1. Active stakes are saved so reloading does not charge an extra ante.

Run the dependency-free rules checks with `node dungeon-21/tests/rules.test.cjs`. These cover gold accounting, bankruptcy and health death, AI descriptions, Identify memory, saved stakes, endless progression, loot, blackjack resolution, local scores, unavailable storage, and 100 seeded runs. DOM and audio are mocked; listening and mobile browser checks remain manual.
