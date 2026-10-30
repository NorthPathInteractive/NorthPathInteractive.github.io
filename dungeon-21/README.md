# Dungeon 21

Playable blackjack roguelike demo, v0.5.0. In development.

Open index.html in a browser or serve this repository as a static website. No install or build step required. Game rules and controls are in the game's How to play panel. Progress and local high scores are stored in your browser when storage is available; New Run resets the active run, inventory and identified enemies.

See [CHANGELOG.md](CHANGELOG.md) for the version history and [the project page](https://northpathinteractive.github.io/projects/dungeon-21/) for What's New.

## Current version

Start an endless run with 10 health and 20 gold. Ante up for blackjack hands, find Identify potions, learn enemy behavior and survive increasingly difficult monsters. Zero health or an unaffordable ante ends the run; remaining gold is your score. Record up to three initials in the local top 10.

Power On unlocks audio and plays the original title theme. Start Adventure or Continue Run enters the dungeon. Play Silently bypasses audio. The Sound button mutes music and effects together; leaving the tab pauses audio. Returning to the page or tapping a control retries paused audio; tap Sound if Power On reports that audio is off.

The new rules use dungeon21-v2 saves. Earlier demo saves remain untouched under dungeon21-v1. Active stakes are saved so reloading does not charge an extra ante.

## Checks

Run `node dungeon-21/tests/rules.test.cjs` and `node dungeon-21/tests/audio.test.cjs` from the repository root.

Checks cover gold accounting, bankruptcy and health death, AI descriptions, Identify memory, saved stakes, endless progression, loot, blackjack resolution, local scores, unavailable storage, and 100 simulated runs. DOM and audio are mocked; listening and mobile browser checks remain manual.

## Shipping a version

Update CHANGELOG.md in the same commit as every shipped version. Include the version, release date, and short player-facing Added, Changed or Fixed entries as appropriate. Keep the README version, project catalogue and project page's What's New summary in sync. Clearly separate shipped changes from future plans.

Pixel art, icon, UI, music and game code created for North Path Interactive. No external assets or dependencies.

## Exploration rooms (v0.4.0)

Each Explore rolls a room: 50% battle, 15% chest, 12% fountain, 8% camp, 8% cursed altar, 4% dart trap, 3% echo chamber. Fountains replace the old scheduled healing rooms. Each noncombat room has a distinct full-screen pixel scene, title and description.

Fountains heal up to 3; camps heal up to 1. Darts deal 1 damage. An altar offers a visible 50/50 choice: +6 gold or 2 damage, or leave for free. Hazards can end a run at zero health, preserving remaining gold as the score. An unresolved altar choice survives reload.

## Hand result screens (v0.5.0)

WIN and LOSE show both hand totals, payouts and damage in larger text. After a surviving loss, Try Again charges the next ante, or Run spends 2 gold and returns to exploration with no kill or reward. Run is unavailable with fewer than 2 gold. If neither option is affordable, or health is zero, the run ends. Pending result screens survive reload.
