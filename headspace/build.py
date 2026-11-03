#!/usr/bin/env python3
"""Build an immutable public release from an approved Drive-manifest snapshot.

Audio is copied byte-for-byte. Remote fetches must match the pinned SHA-256.
The Google Sheet remains authoritative; refresh catalog.json from it before
publishing a new release. No candidates or unchecked sources are accepted.
"""
import argparse
import concurrent.futures
import csv
import hashlib
import html
import io
import json
from pathlib import Path
import shutil
import time
import urllib.request
import zipfile

BASE = Path(__file__).resolve().parent
SLUGS = ['cosmic', 'dream', 'strange-radio', 'the-inner-voice',
         'weird-science', 'night', 'the-absurd', 'the-obscura']
DESCRIPTIONS = [
    'Space broadcasts · vintage sci-fi · astronomical lectures · cosmic electronic music',
    'Surreal poetry · dreamlike readings · ambient soundscapes · experimental tape pieces',
    'Old radio dramas · unusual broadcasts · bizarre educational records · forgotten recordings',
    'Poetry · beat recordings · philosophical voices',
    'Psychology · perception · early electronics · strange scientific lectures',
    'Rain · forests · crickets · ocean · distant thunder · long-form drones',
    'Surreal comedy · experimental spoken word · weird commercials · instructional records',
    'Rare and hard-to-categorize transmissions',
]
FIELDS = [
    ('ID', 'id'), ('Title', 'title'), ('Series / Artist', 'series_or_artist'),
    ('Year', 'year'), ('Date', 'date'), ('Room', 'room'), ('Category', 'category'),
    ('Source / Credit', 'broadcaster_or_source'), ('Source Record', 'source_record'),
    ('Audio URL', 'audio_url'), ('License / Terms', 'license'),
    ('File Policy', 'file_policy'), ('Status', 'status'), ('Drive File', 'drive_url'),
    ('Archive Path', 'archive_path'), ('SHA-256', 'sha256'), ('Bytes', 'bytes'),
    ('Date Type', 'date_type'), ('Date Precision', 'date_precision'),
    ('Retrieval URL', 'retrieval_url'), ('Rights Checked', 'rights_checked'),
    ('Published Audio URL', 'published_audio_url'), ('License URL', 'license_url'),
    ('Date Note', 'date_note'), ('Provenance Note', 'provenance_note'),
]


def esc(value):
    return html.escape(str(value), quote=True)


def digest(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def fetch_audio(item, dest, cache):
    assert item['approval'] == 'APPROVED', 'Unapproved audio cannot be published'
    assert item['rights_checked'] and item['license_url']
    assert '..' not in Path(item['archive_path']).parts
    source = cache / (item['id'] + '.mp3') if cache else None
    if source and source.exists():
        shutil.copyfile(source, dest)
    else:
        for attempt in range(3):
            try:
                req = urllib.request.Request(item['retrieval_url'],
                    headers={'User-Agent': 'HeadspaceArchive/1.0 (source preservation)'})
                with urllib.request.urlopen(req, timeout=90) as response, dest.open('wb') as f:
                    shutil.copyfileobj(response, f)
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(2 * (attempt + 1))
    if dest.stat().st_size != item['bytes'] or digest(dest) != item['sha256']:
        dest.unlink(missing_ok=True)
        raise ValueError('Source bytes changed: ' + item['id'])
    print('Verified ' + item['id'], flush=True)


def write_csv(items):
    f = io.StringIO(newline='')
    w = csv.writer(f)
    w.writerow([title for title, _ in FIELDS])
    w.writerows([[i.get(key, '') for _, key in FIELDS] for i in items])
    return f.getvalue()


class ReleaseZip(zipfile.ZipFile):
    """Fixed timestamps make local and deployed release bytes reproducible."""
    def __init__(self, path, release_date):
        super().__init__(path, 'w', compression=zipfile.ZIP_STORED)
        self.release_time = tuple(map(int, release_date.split('-'))) + (0, 0, 0)

    def writestr(self, name, data, *args, **kwargs):
        info = zipfile.ZipInfo(name, self.release_time)
        info.external_attr = (0o40755 if name.endswith('/') else 0o100644) << 16
        return super().writestr(info, data, *args, **kwargs)

    def write(self, filename, arcname=None):
        return self.writestr(arcname or str(filename), Path(filename).read_bytes())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=BASE / 'public')
    parser.add_argument('--cache', type=Path)
    args = parser.parse_args()
    catalog = json.loads((BASE / 'catalog.json').read_text())
    items = catalog['items']
    assert len({i['id'] for i in items}) == len(items)
    rooms = sorted(catalog['rooms'])
    assert len(rooms) == 8
    out = args.output.resolve()
    out.mkdir(parents=True, exist_ok=True)
    site = out / 'projects/headspace'
    audio = site / 'audio'
    audio.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = [pool.submit(fetch_audio, i, audio / (i['id'] + '.mp3'), args.cache) for i in items]
        for f in futures:
            f.result()
    shutil.copyfile(BASE / 'smithworx-index.html', out / 'index.html')
    css = (BASE / 'style.css').read_text() + '''
html{scroll-behavior:smooth}.room{display:block;color:inherit;text-decoration:none}
.room:hover,.room:focus-visible{border-color:var(--violet);background:#171b35}
.room small{display:block;color:var(--teal);margin-top:15px}.room:focus-visible,a:focus-visible{outline:2px solid var(--teal);outline-offset:4px}
.item{display:block;padding:22px}.item-head{display:grid;grid-template-columns:58px 1fr auto;gap:16px;align-items:start}
.meta,.credit{line-height:1.65;overflow-wrap:anywhere}.year{font:700 14px monospace;color:var(--teal)}
audio{width:100%;margin-top:16px;height:42px}.links{display:flex;flex-wrap:wrap;gap:10px;margin-top:13px}
.links a{font-size:13px;border:1px solid #555b7b;border-radius:24px;padding:9px 14px;text-decoration:none}
.credit{font-size:12px;color:var(--muted);margin:14px 0 0}.category{font:700 20px Georgia;margin:32px 0 20px}
.room-hero{padding:50px 6% 12px}.room-hero h1{font:700 clamp(36px,7vw,72px)/1.1 Georgia;letter-spacing:-1px;margin:18px 0}
.breadcrumb{display:inline-block;padding:12px 0;color:var(--muted)}.small-note{font-size:13px;color:var(--muted);line-height:1.6}
@media(max-width:600px){.item-head{grid-template-columns:1fr auto}.item-head .num{grid-column:1/-1}.item{padding:18px}.top{gap:16px}.back{font-size:12px}.mark{font-size:18px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
'''
    (site / 'style.css').write_text(css)
    script = '''<script>document.addEventListener('play',event=>{if(event.target.tagName==='AUDIO'){document.querySelectorAll('audio').forEach(a=>{if(a!==event.target)a.pause()})}},true);</script>'''

    def page(title, body, prefix=''):
        return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Headspace: calm, cosmic and gently strange audio for nighttime listening and offline exploration."><title>' + esc(title) + '</title><link rel="stylesheet" href="' + prefix + 'style.css"></head><body>' + body + '<footer class="footer">HEADSPACE · nighttime listening · curated by Stephen Prescott Smith<br><br>Source recordings retain their own terms and credits. NASA, JPL and Caltech do not endorse Headspace.</footer>' + script + '</body></html>'

    total_mb = sum(i['bytes'] for i in items) / 1_000_000
    # Preserve the approved landing design; replace only the archive actions/content.
    hero = (BASE / 'landing-template.html').read_text()
    hero = hero.replace('href="#archive"', 'href="#rooms"')
    hero = hero.replace('<span class="btn disabled" title="Enabled when the first archive ZIP is published">Download complete archive — coming soon</span>', '<a class="btn" href="downloads/HEADSPACE-complete.zip" download>Download complete archive · ' + str(len(items)) + ' recordings</a>')
    hero = hero.replace('built to stream on the site and ultimately export as a clean offline collection for an MP3 player.', 'ready to listen here or take offline to your MP3 player.')
    cards = []
    for room, slug, desc in zip(rooms, SLUGS, DESCRIPTIONS):
        count = sum(i['room'] == room for i in items)
        label = f'{count} recordings · Enter room →' if count else 'No recordings yet · Enter room →'
        cards.append(f'<a class="room" href="rooms/{slug}/"><b>{esc(room.title())}</b><span>{esc(desc)}</span><small>{label}</small></a>')
    body = hero + '<section class="section" id="rooms"><h2>The rooms</h2><p class="sub">Choose a room and settle in. Each recording lives in its own corner of the archive.</p><div class="rooms">' + ''.join(cards) + '</div><div class="note">The complete archive contains all ' + str(len(items)) + ' recordings, with the original room and category folders, credits and an offline playlist. Source MP3s are unchanged, including their original tags.</div><p class="small-note">Release ' + catalog['release_date'] + ' · ' + f'{total_mb:.1f}' + ' MB of source audio · <a href="manifest.csv" download>Download the manifest</a></p></section>'
    (site / 'index.html').write_text(page('HEADSPACE — Late-night audio archive', body))

    for room, slug, desc in zip(rooms, SLUGS, DESCRIPTIONS):
        room_items = [i for i in items if i['room'] == room]
        body = '<header class="top"><a class="back" href="../../">← All rooms</a><div class="mark">HEADSPACE</div></header><section class="room-hero"><div class="eyebrow">THE ROOMS / ' + esc(room[:2]) + '</div><h1>' + esc(room[5:].title()) + '</h1><p class="sub">' + esc(desc) + '</p></section><section class="section">'
        for category in catalog['rooms'][room]:
            selected = [i for i in room_items if i['category'] == category]
            if not selected:
                continue
            body += '<h2 class="category">' + esc(category) + '</h2><div class="archive">'
            for i in selected:
                name = i['series_or_artist'] + ' — ' + i['title']
                label = 'Broadcast' if i['date_type'] == 'broadcast' else 'Recording year' if i['date_precision'] == 'year' else 'Source release'
                body += f'''<article class="item" id="{i['id']}"><div class="item-head"><div class="num">{i['id']}</div><div><div class="title">{esc(name)}</div><div class="meta">{esc(label)}: <time datetime="{i['date']}">{i['date']}</time> · {int(i['duration_seconds']//60)}:{int(i['duration_seconds']%60):02d}</div></div><div class="year">{i['year']}</div></div><audio controls preload="none" aria-label="Listen to {esc(name)}" src="../../audio/{i['id']}.mp3"></audio><div class="links"><a href="../../audio/{i['id']}.mp3" download="{esc(i['filename'])}">Download MP3</a><a href="{esc(i['source_record'])}" target="_blank" rel="noopener">Original source ↗</a></div><p class="credit">{esc(i['broadcaster_or_source'])}<br><a href="{esc(i['license_url'])}">{esc(i['license'])}</a> · Original MP3 preserved unchanged.</p>'''
                if i.get('provenance_note'):
                    body += '<p class="credit">' + esc(i['provenance_note']) + '</p>'
                if i['date_precision'] == 'year':
                    body += '<p class="credit">' + esc(i['date_note']) + '.</p>'
                body += '</article>'
            body += '</div>'
        if not room_items:
            body += '<div class="note">This room is waiting for its first approved recordings.</div>'
        body += '<p class="small-note"><a href="../../downloads/HEADSPACE-complete.zip" download>Download the complete Headspace archive</a> · <a href="../../">Explore all rooms</a></p></section>'
        directory = site / 'rooms' / slug
        directory.mkdir(parents=True, exist_ok=True)
        (directory / 'index.html').write_text(page(room[5:].title() + ' — HEADSPACE', body, '../../'))

    manifest = write_csv(items)
    (site / 'manifest.csv').write_text(manifest, encoding='utf-8-sig')
    (site / 'catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    # ZipFile uses UTF-8 filenames and supports the unchanged source folder names.
    downloads = site / 'downloads'
    downloads.mkdir(exist_ok=True)
    zpath = downloads / 'HEADSPACE-complete.zip'
    with ReleaseZip(zpath, catalog['release_date']) as z:
        for room in rooms:
            z.writestr('HEADSPACE/' + room + '/', '')
            for category in catalog['rooms'][room]:
                z.writestr('HEADSPACE/' + room + '/' + category + '/', '')
        for i in items:
            z.write(audio / (i['id'] + '.mp3'), 'HEADSPACE/' + i['archive_path'])
            sidecar = json.dumps(i, ensure_ascii=False, indent=2) + '\n'
            z.writestr('HEADSPACE/' + i['archive_path'] + '.json', sidecar)
        z.writestr('HEADSPACE/HEADSPACE — Archive Manifest.csv', '\ufeff' + manifest)
        z.writestr('HEADSPACE/catalog.json', json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
        z.writestr('HEADSPACE/SHA256SUMS.txt', ''.join(i['sha256'] + '  ' + i['archive_path'] + '\n' for i in items))
        z.writestr('HEADSPACE/Play all.m3u8', '#EXTM3U\n' + ''.join(f"#EXTINF:{int(i['duration_seconds'])},{i['series_or_artist']} — {i['title']}\n{i['archive_path']}\n" for i in items))
        z.writestr('HEADSPACE/README.txt', 'HEADSPACE — release ' + catalog['release_date'] + '\n\nUnzip and copy the HEADSPACE folder to your MP3 player.\nBrowse by folder, or use Play all.m3u8 on a compatible player.\nAll included MP3s are source files preserved byte-for-byte. Original ID3 tags are unchanged.\nClean Headspace metadata, dates, credits, terms and provenance are in the manifest and JSON sidecars.\nSome players sort by embedded tags; use folder browsing for the Headspace hierarchy.\n\nThe OTRR collections label the radio files CC BY-NC-ND 3.0 US.\nhttps://creativecommons.org/licenses/by-nc-nd/3.0/us/\nCredit: NBC / Old Time Radio Researchers / Internet Archive.\nNASA recordings: see per-item credits and NASA media usage guidelines.\nhttps://www.nasa.gov/nasa-brand-center/images-and-media/\nNo NASA, JPL or Caltech endorsement is implied.\nThis is a noncommercial collection; retain all attribution and license notices.\nDo not sell the complete collection or modify the NoDerivatives recordings.\n\nDates refer to original broadcasts or identified NASA source releases.\nHS-009 retains year-only precision: its exact recording day has not been verified.\nHS-006 is NASA’s original MP3 recovered from a verified Wayback capture.\nEmpty folders reflect the existing archive taxonomy; they contain no unapproved audio.\n')
    with zipfile.ZipFile(zpath) as z:
        assert z.testzip() is None
        for i in items:
            assert hashlib.sha256(z.read('HEADSPACE/' + i['archive_path'])).hexdigest() == i['sha256']
    print(f'Built {len(items)} approved recordings; ZIP {zpath.stat().st_size} bytes', flush=True)


if __name__ == '__main__':
    main()
