# Dungeon 21

Playable blackjack dungeon quest, v0.9.0. In development.

[Play the game](https://northpathinteractive.github.io/dungeon-21/) · [Project page](https://northpathinteractive.github.io/projects/dungeon-21/) · [CHANGELOG.md](CHANGELOG.md)

## The Obsidian Veil

The king sends a hero into four halls with 10 health, 5 gold and an empty inventory. Buy one key in each hall and find its sealed stair. Your health, gold, inventory and identified enemies carry forward on descent. The final key opens a glistening chamber, its boss and the secret.

| Hall | Required key | Price | Monster roster |
| --- | --- | ---: | --- |
| Emerald | Red | 25 | Moss Goblin, Cave Bat, Thorn Imp |
| Ruby | Blue | 50 | Cinder Hound, Blood Skeleton, Ash Orc, Ember Witch |
| Sapphire | Gold | 75 | Frost Spider, Drowned Knight, Glacier Troll, Rime Wraith, Abyss Serpent |
| Amethyst | Amethyst | 100 | Void Moth, Crystal Revenant, Dusk Vampire, Starless Seer, Prism Wyrm, Amethyst Dragon |

More monsters unlock as you defeat enemies within a hall. Each deeper hall raises antes, hearts, damage and playing intelligence. The final Crownless King has six hearts, an 8-gold ante and deals 4 damage per lost hand.

## Exploration and spending

Base room chances: battle 45%, chest 18%, shop 12%, sealed stair 8%, fountain 5%, altar 4%, camp 3%, trap 3%, eerie chamber 2%. A shop is guaranteed by the eighth exploration without one; this overrides the ordinary roll. A staircase cannot be entered without the current key. Shops sell one required key, healing and Identify potions for 5 gold each. Purchases confirm before charging. Use a carried healing potion through Inventory to restore up to 4 health; use confirms and consumes one potion without spending additional gold. Fountains restore up to 3; camps restore 1. Altars offer a visible 50/50 choice of +6 gold or 2 damage; leave for free. Traps deal 1 damage.

Every blackjack hand costs an ante. Win and collect twice your stake, lose and forfeit the stake plus health, tie and receive the stake back. WIN/LOSE screens show both totals. After a surviving loss, Run costs 2 gold or Try Again pays another ante. Zero health or being unable to afford either ends the run. Remaining gold is the final score. Natural blackjack beats an ordinary 21.

## Shared passwords and admin testing

Codes ignore capitalization and surrounding spaces. Every descent displays the next hall's password. Standard password starts receive 10 health and 5 gold. Admin starts receive 10 health and 1,000 gold and never enter rankings.

| Code | Hall | Mode |
| --- | --- | --- |
| Emerald | Emerald | Normal |
| Ruby | Ruby | Normal |
| Sapphire | Sapphire | Normal |
| Amethyst | Amethyst | Normal |
| Gold | Emerald | Admin |
| Goldruby | Ruby | Admin |
| Goldsapphire | Sapphire | Admin |
| Goldamethyst | Amethyst | Admin |

Entering a valid code confirms before replacing a quest already underway. Passwords are shared checkpoints, not personal saves. They do not restore your previous inventory or bankroll.

## Saves, scores and sound

The quest uses `dungeon21-quest-v1` (schema 3); older endless saves remain untouched. Local top-10 scores continue under `dungeon21-scores-v1`. There is no server leaderboard. Fictional STARTER entries are labelled and replaced in the ranking by better real scores. Finishing or dying shows scrolling scores; reduced-motion preferences disable scrolling and shimmering animations.

Power On enables title music; Begin the Quest or Continue enters play. Original exploration, battle, victory and defeat music and effects are preserved. Sound controls everything. Audio pauses when hidden and retries recovery on return or the next gesture.

## Development and verification

Serve this repository as a static website or open index.html in a browser. No install or build step is required. Run `node dungeon-21/tests/rules.test.cjs` and `node dungeon-21/tests/audio.test.cjs` from the repository root. Rules tests cover codes, story, keys, progression, boss ending, room probabilities, shop guarantees, healing confirmation, scores, saves, stakes and 100 seeded quests. Browser and audio are mocked in those tests; browser layout and listening require separate checks.

## Shipping a version

Update CHANGELOG.md in the same commit as shipped changes. Keep the game, README, catalogue, homepage card and project page's version and What's New summary consistent. Preserve history and link the project page to the authoritative changelog. Do not claim deployment is live until verified.

Pixel art, UI, music and game code created for North Path Interactive. No external assets or dependencies.

## Controls, Status and result text (v0.8.0)

Inventory sits at the top of the game screen. Exploration offers Explore and Status; battles offer Hit and Stand. The display uses the earlier natural layout rather than a fixed-height scroller or permanent footer buttons. Inventory holds purchased healing and Identify potions; prices and confirmation rules from v0.7.0 remain unchanged. I opens/closes Inventory; Escape closes Inventory or Status.

Status shows hall and gate progress, health, gold, supplies, kills and rooms, identified enemies, hand results, damage, healing, escapes, ante and stake, the hall password, mode, tracked time and local-save availability. New counters persist in the quest save. Existing saves retain all previous progress; counters and time that were not previously recorded are clearly labelled as starting at this update.

Result text is compact: -1G ante, +2G returned, -1♥ and +4♥. Gold changes use gold/yellow text regardless of sign; health loss is red and healing green. Item/key information is purple. Coloured backgrounds have been removed; descriptions, words and signs retain the meaning.

## Visible monster turns (v0.9.0)

Stand reveals the monster's full hand and a turn log: reveal, any hits with running totals, then a stand or bust announcement. The hand stays visible until Show Result (E). Settlement occurs only once and the paid ante remains intact on reload. Hit reaching 21 uses the same review. A player bust or a natural blackjack still resolves immediately because the monster does not need to take a normal turn.
