# Dungeon 21

Playable blackjack dungeon quest, v0.17.0. In development.

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

Version 0.9.1 fixes stale asset references; the monster-turn review appears above the cards. Release checks verify that the display and asset cache versions match.

## Animated moves and vocoded cues (v0.10.0)

Player and monster moves display matching actor-labelled HIT/STAND banners. The monster reveals its hand and takes hits one card at a time, with running totals, at 1.2-second intervals. Next Move advances manually; Show Result is available after the final stand/bust. Inventory and backgrounding pause progression. Pending frames save without rerolling or repeating payouts. Reduced-motion preferences remove the sliding banner animation.

The two short voice assets in audio/ were generated locally with Flite and processed with a 14-band synthetic-carrier vocoder, retaining some dry speech for intelligibility. They contain only “Hit” and “Stand”, are loaded locally, and follow the existing Sound setting. The original chiptune music/effects remain procedural.

## Door discovery (v0.11.0)

The hall HUD, Status, story and entry text do not reveal the next key or its price. Random door rooms keep the existing 8% chance. Try Descend to learn the required key; failure spends nothing. Shops list key prices. The Ruby Door has red panels surrounded by Emerald stonework, and the Red Key shop button remains red even when unaffordable. Existing saves, carried keys and door-room states remain compatible.

## Leaving battles (v0.11.1)

Battle outcomes stay on their result screen. Continue after defeating a monster explores exactly one new random room immediately; running after a loss deducts 2G and does the same. No duplicate result message or extra Explore press follows. Multi-heart fights stay in battle for the next hand, and terminal win/game-over screens remain visible. Fleeing the final boss returns to its chamber.

## Opening blackjacks (v0.11.2)

An opening natural blackjack reveals both hands and waits for Show Result before applying payouts, damage or monster defeat. This uses the same saved monster-review state as ordinary turns, including after reload. Player, monster and simultaneous blackjacks retain their existing rules.

## Automatic results and hand callouts (v0.12.0)

HIT/STAND callouts sit beside the acting hand, with totals and cards unobstructed. After the final foe move, the hand stays visible for 1.2 seconds before automatic results; opening blackjacks remain visible for 1.8 seconds. Inventory, Status and hidden tabs pause the sequence. Reload resumes review without paying again. Ties have a DRAW result screen.

## Character voices (v0.13.0)

The player keeps the original vocoded HIT/STAND samples. Each of the 18 monster types and the Crownless King has a distinct, stable pitch/tone/echo profile. Bats and imps are high and sharp; orcs and trolls are low and heavy; spirits echo; the Amethyst Dragon has the deepest, loudest booming profile. Bass shaping and compression keep monster speech controlled on the effects bus. Profiles apply equally to both words and follow the existing Sound setting. No external voice service or new download is needed.

## Attribute feedback (v0.14.0)

Only signed, actual changes receive emphasis in room/battle descriptions. Possible payouts, prices, required keys and item counts stay plain. The Red Key shop listing retains its intentional red item styling. Actual gold/health balance changes flash in the player hand area, result screen or room; these announcements are computed from balance changes between renders, never from a quoted cost. Loading or redrawing a save does not replay a change. The loss result describes the forfeited ante plainly because gold was already deducted on the deal. Damage text uses the actual health lost, capped at remaining health.

## Hall exploration music (v0.15.0)

Emerald retains its original sparse 72 BPM exploration theme. Ruby introduces an 88 BPM expedition march; Sapphire adds rolling minor-key arpeggios and a pulse at 104 BPM; Amethyst rises into a fuller 120 BPM final-hall adventure. Each new theme has its own 64-step lead, bass and harmony. Hall changes and password starts select the right theme. The title, battle, fanfare, effects and voices are unchanged.

## Combined battle log (v0.16.0)

The battle log records the player’s opening hand, hits with card/totals, stands and busts, then the foe’s revealed moves in order. It remains visible during play and on the result screen, uses uniform 14px text, and resets each new hand. Player history is saved separately from foe animation frames so it survives stepping/reload without duplicating. Earlier saves remain valid; past player actions that were never recorded are not invented.

## Defeat recap (v0.17.0)

A defeated quest shows a palette-matched RIP gravestone and run statistics between score entry and the scrolling Hall of Fortune. It includes final gold, hall, remaining health, explored rooms, defeated monsters, hand results, damage/healing, escapes, known foes, remaining supplies, key and mode. Newly ended runs save their end time so the recap time stays fixed across reload. Older saves without an end timestamp show time as Not recorded; partially tracked older counters retain their explanation. Victory screens and score ranking are unchanged.

## Fixed recent-move display (v0.17.0)

The battle-log heading is removed. Only the last three moves are displayed in three fixed two-line slots; long entries truncate visually while retaining their full accessible text. Earlier moves remain saved internally. The display has the same height from the opening hand onward, preventing log growth from moving the cards and controls.
