# Headspace publishing

Canonical storage is DJ GNF Drive, `HEADSPACE` folder
`1QMzgbzCGOqnlS8lBPSydX6L0KZcnOmtp`. The existing Google Sheet
`12Ce7Ay2Yci53SMuPGzhIpAsFZIv24V8Nmgpqwyb1df0` is the metadata authority.
`catalog.json` is an explicit publishing snapshot of that manifest, not a second
editable master. Refresh it from the Sheet for each approved release.

## Adding approved audio

1. Give Steve original-source listening links and record approval first.
2. Verify title, exact date and precision, source and redistribution terms.
3. Download the source MP3 to the current workspace. Check the audio container,
   source checksums where available, and record SHA-256 and size.
4. Use the Google Drive connector `upload_file` with the **absolute local path**
   in `file_uri`, DJ GNF link ID, observed category folder ID and filename.
   The runtime supplies a connector-backed file reference automatically. A
   Vercel sandbox path is not a local path in this workspace. Dropbox is not
   needed as an intermediate service. Verify Drive parent, size and MIME type.
5. Update the existing Sheet row, preserving approval, dates, terms and source
   URLs. Record Drive file URL, archive path, byte size and SHA-256.
6. Refresh `catalog.json` from the Sheet. Preserve audio bytes and ID3 tags.
7. Run `python3 build.py --output public`. Optional `--cache /absolute/path`
   reads local files named `HS-001.mp3`, etc. Every file must match its SHA-256.
8. Deploy to the existing `smithworx` project in the `stevepsmith` scope. Keep
   the existing homepage intact. Vercel build command: `python3 build.py`;
   output directory: `public`. Upload only publishing source, not MP3 binaries.
   The build retrieves pinned audio, verifies it and creates the static media
   and complete ZIP. A changed/missing source fails the build and leaves the
   previous release live. Source URLs can later be refreshed using verified
   copies from canonical Drive, retaining the same SHA-256.
9. Verify room contents, playback, MP3 downloads, metadata and ZIP checksums.
   Save the complete release ZIP as a durable downloadable artifact, then record
   `ARCHIVED / PUBLISHED` in the manifest for the release's verified items.

## Release contents

The ZIP contains the existing room/category hierarchy, unchanged source MP3s,
per-file JSON metadata, manifest CSV, SHA256SUMS, credits/terms and an M3U8
playlist. The website and ZIP are generated together from one approved snapshot.
Empty folders are placeholders, never permission to add unapproved audio.

Original NASA Interstellar Plasma MP3 is recovered from a Wayback capture of
NASA's former public file. Its SHA-1 was verified against the CDX digest; the
publishing snapshot pins the SHA-256. The date is the NASA Photojournal release
date (2013-09-12), not the later SoundCloud upload date.

The current source homepage is preserved in `smithworx-index.html`. Refresh it
from the live root before a later Headspace deployment so unrelated homepage
changes are never overwritten. Live publication uses Vercel, not GitHub Pages.

Future larger releases should use dedicated object storage for public media
when static publishing becomes cumbersome; Google Drive remains the master.

The Drive upload adapter currently rejects a single file above 100 MiB. The
first complete ZIP is 114,567,809 bytes and is served on Vercel and retained as
a durable downloadable artifact. All nine master MP3s are individually in Drive.
The Drive root contains a release note pointing to the complete public ZIP.
