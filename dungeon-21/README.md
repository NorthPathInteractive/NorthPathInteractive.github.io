# Dungeon 21

Playable blackjack roguelike demo, v0.3.0. In development.

Open index.html in a browser or serve this repository as a static website. No install or build step required. Game rules and controls are in the game's How to play panel. Progress and local high scores are stored in your browser when storage is available; New Run resets the active run, inventory and identified enemies.

See [CHANGELOG.md](CHANGELOG.md) for the version history and [the project page](https://northpathinteractive.github.io/projects/dungeon-21/) for What's New.

## Current version

Start an endless run with 10 health and 20 gold. Ante up for blackjack hands, find Identify potions, learn enemy behavior and survive increasingly difficult monsters. Zero health or an unaffordable ante ends the run; remaining gold is your score. Record up to three initials in the local top 10.

Power On unlocks audio and plays the original title theme. Start Adventure or Continue Run enters the dungeon. Play Silently bypasses audio. The Sound button mutes music and effects together; leaving the tab pauses audio.

The new rules use dungeon21-v2 saves. Earlier demo saves remain untouched under dungeon21-v1. Active stakes are saved so reloading does not charge an extra ante.

## Checks

Run `node dungeon-21/tests/rules.test.cjs` from the repository root.

Checks cover gold accounting, bankruptcy and health death, AI descriptions, Identify memory, saved stakes, endless progression, loot, blackjack resolution, local scores, unavailable storage, and 100 simulated runs. DOM and audio are mocked; listening and mobile browser checks remain manual.

## Shipping a version

Update CHANGELOG.md in the same commit as every shipped version. Include the version, release date, and short player-facing Added, Changed or Fixed entries as appropriate. Keep the README version, project catalogue and project page's What's New summary in sync. Clearly separate shipped changes from future plans.

Pixel art, icon, UI, music and game code created for North Path Interactive. No external assets or dependencies.
