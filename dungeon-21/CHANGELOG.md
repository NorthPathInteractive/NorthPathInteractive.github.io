# Dungeon 21 changelog

Changes are listed newest first. Dates use America/Toronto time.

## 0.17.0 — 2026-10-30

### Changed
- Replaced the expanding battle log with a heading-free, fixed-height display of the last three moves. Cards and controls no longer move as the log fills.

### Added
- A small pixel-art RIP gravestone and run-stat recap on defeat, just above the scrolling Hall of Fortune.
- The recap includes score, hall, health, explored rooms, defeated monsters, hand results, damage/healing, escapes, identified enemies and remaining supplies.
- End timestamps keep new recap times fixed across reload. Older missing or partial statistics are labelled honestly; existing saves and scores remain compatible.

## 0.16.0 — 2026-10-30

### Changed
- The battle log includes the player’s opening cards, HIT draws/totals, STAND and busts before the foe’s actions.
- All log entries use the same text size and weight; the final line no longer enlarges.
- The combined log is visible during play and on the result screen, persists across reload, and resets for each hand. Existing saves remain compatible.

## 0.15.0 — 2026-10-30

### Added
- Separate exploration music for Ruby, Sapphire and Amethyst, progressing from an expedition march to rolling arpeggios and a fuller final-hall adventure.
- The new themes build in pace: Ruby 88 BPM, Sapphire 104 BPM, Amethyst 120 BPM.
- Emerald’s original 72 BPM exploration theme, title music, battle music, effects and voices are unchanged.

## 0.14.0 — 2026-10-30

### Changed
- Room/battle emphasis now marks actual signed changes; possible payouts, prices, required-key mentions and inventory counts remain plain.
- Actual gold and health balance changes flash near the player’s cards, or on the result/room screen. Reloading or redrawing does not replay them.
- Loss results describe the already-paid ante plainly, without suggesting another debit. Damage text reports only health actually lost.
- The Red Key shop listing retains its requested red styling.

## 0.13.0 — 2026-10-30

### Added
- Distinct HIT/STAND voice profiles for all 18 monster types and the Crownless King, with character-specific pitch, tone, bass and echo.
- A deep, louder booming voice for the Amethyst Dragon; high bats and imps, heavy orcs and trolls, and echoing spirits.
- The player retains the original vocoded voice. Monster processing follows Sound and uses compression to control peaks.

## 0.12.0 — 2026-10-30

### Changed
- Results appear automatically 1.2 seconds after the foe’s final move, with no Show Result tap. Opening blackjacks remain visible for 1.8 seconds before settling.
- HIT/STAND flashes sit beside the acting side’s cards instead of above the battle. Cards and totals remain clear; vocoded speech is preserved.
- Ties now display a DRAW result screen with the returned stake.
- Inventory, Status and background tabs pause automatic settlement. Saved reviews resume and settle only once.

## 0.11.2 — 2026-10-30

### Fixed
- Opening blackjacks no longer resolve during the deal before the battle can be seen. Both hands and totals appear first; Show Result applies the outcome.
- Player, monster and simultaneous blackjacks preserve the paid stake and review across reload, with settlement applied only once.

## 0.11.1 — 2026-10-30

### Fixed
- Continue after defeating a monster now explores the next room automatically, instead of repeating the battle result in the hallway.
- Running after a loss spends 2G and immediately explores the next room. Battle outcomes remain on the battle result screen; multi-heart fights and final ending screens keep their existing flow.
- Fleeing the final boss returns to its chamber. Existing saves and scores remain compatible.

## 0.11.0 — 2026-10-30

### Changed
- Discover the route down through random gem-coloured door rooms. Attempting a locked door reveals its required key without spending gold.
- Removed next-key prices and directions from the hall HUD, Status, story and hall-entry text. Shop listings reveal prices when encountered.
- The Ruby Door stands out in red against Emerald stonework; the shop's Red Key listing uses red text, including when unaffordable.
- Existing saves, key prices, room probabilities and hall progression are preserved.

## 0.10.0 — 2026-10-30

### Added
- Monster turns now unfold one step at a time: reveal the hidden card, draw each hit card separately with its updated total, then visibly stand or bust.
- Matching brief HIT and STAND banners for the player and monster, with actor labels. Monster busts also display BUST. Reduced-motion preferences disable the banner's slide animation.
- Original synthetic vocoded “Hit” and “Stand” voice clips for both sides. These play through the existing Sound control and pause/mute with the game audio.
- Next Move can advance a step manually; Show Result appears after the monster finishes. Pending steps survive reload without rerolling cards, repaying antes or paying twice.

### Changed
- Automatic monster steps are spaced 1.2 seconds apart. Opening Inventory or hiding the page pauses the sequence; closing/returning resumes it.
- Existing saves and completed monster reviews remain compatible. All asset cache labels match the release.

## 0.9.1 — 2026-10-30

### Fixed
- Corrected stale v0.6.0 stylesheet and script references. All asset cache versions now match the displayed v0.9.1, so an updated title cannot keep using the old combat code.
- Moved the monster-turn review above the cards, with a larger stand/bust announcement, making it visible earlier on smaller screens.
- Added a regression check that the displayed version and every local script/stylesheet cache version match.

## 0.9.0 — 2026-10-30

### Added
- A visible monster-turn review after Stand (also when your Hit reaches 21): the hidden card is revealed, hits are listed with their running totals, and the monster announces its final stand or bust.
- Show Result resolves the reviewed hand once. The final decision is retained in the WIN/LOSE result text.
- Pending monster-turn reviews survive reload with the already-paid stake intact. Battle controls and item use are locked during review to avoid changing a completed turn.

### Changed
- Standing no longer jumps straight to WIN/LOSE. The player can inspect the monster's full hand first.
- Existing quest saves, inventory, counters and local scores remain compatible.

## 0.8.0 — 2026-10-29

### Added
- A Status screen from exploration: hall, health, gold, rooms, kills, required/carried key, potions, known enemies, hand results, damage, healing, escapes, current ante/stake, shop interval, password, mode, tracked time and save availability.
- Persisted run counters for wins, losses, ties, damage, restored health and escapes. Older saves keep existing progress; new counters and time are explicitly marked as tracked from this update.

### Changed
- Restored the earlier contextual layout: Hit/Stand in combat, Explore/Status during exploration, and Inventory near the top. Removed the fixed footer controls and fixed-height scrolling display.
- Replaced coloured highlight boxes with coloured text only. Currency uses G, including negative gold in gold/yellow text; health uses ♥, with damage red and healing green.
- Compact result examples: -1G ante, +2G returned, -1♥ and +4♥. Room descriptions remain intact.
- Inventory and Status use their own clean views with Back/Close controls. Existing purchased potions, quests and scores remain compatible.

## 0.7.0 — 2026-10-29

### Added
- Persistent Explore and Inventory buttons anchored at the bottom of the game screen. Room and battle details scroll above them; Explore remains visible but disabled during battles and unresolved choices.
- An inventory panel showing healing potions, Identify potions and the current key. I opens/closes Inventory; Escape closes it.
- Healing potions purchased for 5 gold each and carried until used. Healing restores up to 4 health, consumes one potion and asks for confirmation. Potion purchases also confirm before charging.
- Result highlights: red for damage and spending, gold for gold gained, green for healing, purple for item/key information. Bold words and numbers retain their meaning without colour.

### Changed
- New quests start with no potions or keys, retaining the king's 5 starting gold.
- Both healing and Identify potions now cost 5 gold in shops. Removed the direct gold-for-healing action; use a purchased potion through Inventory instead.
- Inventory can be used during a living battle without paying another ante or resetting the hand. At full health or without a potion, healing is disabled.
- Existing v0.6.0 quest saves retain their progress, gold and Identify potions and begin with zero healing potions. Local scores and older demo saves remain preserved.

## 0.6.0 — 2026-10-29

### Added
- The king's opening story: descend into the Halls of the Obsidian Veil, unlock four gates, face the Crownless King and reveal the final secret.
- Emerald, Ruby, Sapphire and Amethyst Halls with separate palettes and 18 distinct monsters and pixel sprites. Deeper halls raise antes, damage, endurance and AI difficulty; more monster types unlock with kills within each hall.
- Random item shops selling the current hall's key, Identify potions (4 gold) and healing (5 gold). One required key per hall: Red 25, Blue 50, Gold 75, Amethyst 100. Keys cannot be purchased twice and are consumed on descent.
- Sealed stair rooms, shared hall passwords, a glistening final chamber and a six-heart final boss.
- Title-screen Enter Code and High Scores buttons; scrolling high scores on the title menu and at the end of a run. Low fictional STARTER entries are clearly labelled.
- Shared codes Emerald, Ruby, Sapphire and Amethyst start at that hall with 10 health and 5 gold. Gold, Goldruby, Goldsapphire and Goldamethyst start the corresponding hall with 1,000 gold. Codes ignore capitalization. Admin runs are labelled and excluded from rankings.

### Changed
- Replaced endless progression with a four-hall quest. New normal quests start with only 5 gold and 10 health.
- Approved base room distribution: battles 45%, chests 18%, shops 12%, stairs 8%, fountains 5%, altars 4%, camps 3%, traps 3%, eerie chambers 2%. A shop appears by the eighth exploration without one, overriding the random roll.
- Large hand totals now sit directly beside their cards. Healing always asks for confirmation before spending gold.
- The quest uses a separate save key. Older endless-demo saves and existing local high scores remain on the device; the new quest begins fresh.
- Updated the game, catalogue and project page to v0.6.0, with consistent asset cache labels.

## 0.5.0 — 2026-10-29

### Added
- Dedicated WIN and LOSE screens with player and monster totals and the hand's gold/health result.
- After a surviving loss, Try Again pays the next ante; Run costs 2 gold and returns to exploration without a kill or reward.
- Result screens persist on reload. A monster-defeating win waits for Continue before exploration resumes.

### Changed
- Larger game text, cards, controls and especially prominent card totals.
- If a lost hand leaves too little gold for the next ante but enough to flee, offer the escape choice. If neither can be afforded, or health reaches zero, the run ends.
- Run is disabled when fewer than 2 gold remain; it never charges twice or refunds the lost ante.
- Existing saves, inventory, knowledge and local high scores remain compatible.

## 0.4.0 — 2026-10-29

### Added
- Distinct full-room pixel scenes for treasuries, whispering fountains, abandoned camps, cursed altars, dart galleries and echo chambers. Replaced the central doorway block in exploration.
- Camps restore up to 1 health; eerie chambers offer atmospheric discoveries without a reward or penalty.
- Cursed altars: leave safely, or take a clearly stated 50% chance of 6 gold versus 2 damage. Pending choices survive reload and cannot be claimed twice.
- Occasional hidden darts deal 1 damage. Room hazards can end a run; remaining gold is still the final score.

### Changed
- Exploration uses a random room pool: 50% battles, 15% chests, 12% fountains, 8% camps, 8% altars, 4% traps and 3% echo chambers.
- Fountains now occur randomly instead of every third room. Existing saves, Identify knowledge and high scores remain compatible.

## 0.3.1 — 2026-10-29

### Fixed
- Recover paused audio on the next tap or key press after a phone, lock-screen or tab interruption.
- Request a playback audio session where supported, so the soundtrack is not treated as ambient audio.
- Keep Power On responsive if the browser cannot resume audio; show how to retry with the Sound button.
- Refresh game, music and stylesheet cache labels together with the displayed version.
- Preserve current saved runs and local high scores.

## [0.3.0] — 2026-10-28

### Added
- Local top-10 high scores with up to three initials. Final score is the gold remaining when a run ends.
- Stackable Identify potions found in chests. Use one during battle to reveal an enemy's level and exact playing behavior.
- Identification memory for each monster type and level throughout the run; unidentified enemies display “Not identified.”
- Increasing monster levels with larger antes, more endurance and tougher playing rules.
- Rules checks covering gold accounting, game-over conditions, identification, saved stakes, local scores and 100 simulated runs.

### Changed
- Replaced the five-monster campaign with an endless dungeon. Defeating a dragon no longer ends the run.
- Players start with 10 health and 20 gold for the initial balance test.
- Every blackjack hand requires an ante, matched by the monster. A win returns twice the ante, a tie refunds it, and a loss costs the ante plus health.
- Per-hand winnings replace monster-defeat gold bonuses. Automatic experience-based health upgrades were removed.
- Runs end at zero health or when the next ante cannot be paid. Remaining gold still counts as the score.
- Chests can contain gold or Identify potions.
- The new rules use a separate save format. Older demo saves remain untouched, and reloading an active hand does not charge the ante again.

## [0.2.0] — 2026-10-28

### Added
- A title screen with Power On, Start Adventure / Continue Run, and Play Silently controls.
- Original synthesized title, eerie exploration and battle music.
- Monster-victory, dungeon-clear and defeat cues.
- Card, hit, hurt, treasure and healing sound effects.
- Brief visual feedback for hits and player damage, respecting reduced-motion preferences.

### Changed
- The Sound button controls both music and effects.
- Audio pauses when the page is hidden.
- Existing version 0.1.0 runs remain compatible with this version.

## [0.1.0] — 2026-10-28

### Added
- Initial playable Game Boy–style blackjack RPG demo.
- Explore, Hit and Stand controls, hidden enemy cards, ace scoring and natural-blackjack resolution.
- A five-monster campaign: Goblin, Skeleton, Orc, Vampire and Dragon.
- Monster hearts, player health, gold, experience, healing fountains and healing potions.
- Saved progress on the current browser and device.
- A North Path Interactive project listing and description page.

[0.3.0]: https://github.com/NorthPathInteractive/NorthPathInteractive.github.io/commit/1997d1af469a9b2d961efb5d4e81356633cf05c3
[0.2.0]: https://github.com/NorthPathInteractive/NorthPathInteractive.github.io/commit/5b450c56c0e26240cf07b8535cf97c3340e34533
[0.1.0]: https://github.com/NorthPathInteractive/NorthPathInteractive.github.io/commit/b8924004f4620c05d190b7c57d21cca98501bda2
