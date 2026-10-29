# C64 RPG development player

Player v0.1.2. Development URL: /c64-rpg-dev/. Main portfolio entries are unchanged.

Uses the official VirtualC64Web GitHub Pages emulator in an iframe. NPI hosts the launcher, games and firmware; emulator runtime availability depends on vc64web.github.io. Uses its documented postMessage load interface with explicit target origin and incoming source/origin checks. Three ROMs are installed with each launch to avoid reusing incompatible Open ROMs from browser storage. See [firmware sources](roms/SOURCES.md).

Game binaries are unchanged. Asterra test slice PRG is extracted from the original D64 to avoid needing a separate disk-drive ROM. Original disk archives remain in the archive preparation branch. No saves added.

[Changelog](CHANGELOG.md).
