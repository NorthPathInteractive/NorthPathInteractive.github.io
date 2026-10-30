# Dungeon 21 changelog

Changes are listed newest first. Dates use America/Toronto time.

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
