# Dungeon 21 changelog

Changes are listed newest first. Dates use America/Toronto time.

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
