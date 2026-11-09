#!/usr/bin/env python3
"""Verify the static student site, with optional media checks before rendering.

Run: python3 scripts/verify_site.py [--skip-media]
This checks source references, packaged assets, caption syntax, and encoding
metadata. It does not replace browser interaction or visual film review.
"""

from __future__ import annotations

import argparse
from fractions import Fraction
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit


EXPECTED_FILMS = (
    "01-uttryck", "02-monster", "03-forenkla",
    "04-ekvationer", "05-problem", "06-bada-led",
)


class HTMLResources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources: list[str] = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        for name in ("src", "poster"):
            if name in attrs:
                self.resources.append(attrs[name])
        # Ordinary hyperlinks may deliberately lead to publisher sources.
        if tag == "link" and attrs.get("href"):
            self.resources.append(attrs["href"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-media", action="store_true", help="Validate source/runtime assets before all six films have rendered.")
    parser.add_argument("--dist", type=Path, default=Path(__file__).resolve().parents[1] / "dist")
    parser.add_argument("--ffprobe", help="Optional ffprobe executable path.")
    args = parser.parse_args()
    dist = args.dist.resolve()
    errors: list[str] = []
    checked: set[Path] = set()
    pending: list[Path] = []

    def fail(message):
        errors.append(message)

    def relative(path):
        try:
            return str(path.relative_to(dist))
        except ValueError:
            return str(path)

    def resource(url: str, owner: Path):
        url = url.strip().strip("\"'")
        if "${" in url:
            # Film template paths are expanded against all six slugs below.
            if not re.fullmatch(r"assets/(?:films|posters|captions)/\$\{t\.film\}\.(?:mp4|jpg|vtt)", url):
                fail(f"Unresolved dynamic resource in {relative(owner)}: {url}")
            return
        if not url:
            fail(f"Empty runtime asset URL in {relative(owner)}")
            return
        parsed = urlsplit(url)
        if parsed.scheme == "data" or url.startswith("#"):
            return
        if parsed.scheme or parsed.netloc:
            fail(f"Remote runtime asset in {relative(owner)}: {url}")
            return
        path = (dist / unquote(parsed.path).lstrip("/") if url.startswith("/") else owner.parent / unquote(parsed.path)).resolve()
        if not path.is_relative_to(dist):
            fail(f"Runtime asset escapes dist: {url} in {relative(owner)}")
            return
        if not path.is_file():
            fail(f"Missing local asset: {relative(path)} (from {relative(owner)})")
            return
        if path.stat().st_size == 0:
            fail(f"Empty local asset: {relative(path)}")
        if path.suffix in (".html", ".css", ".js") and path not in checked:
            pending.append(path)

    index = dist / "index.html"
    if not index.is_file():
        fail(f"Missing entry point: {index}")
    else:
        pending.append(index)

    while pending:
        path = pending.pop()
        if path in checked:
            continue
        checked.add(path)
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            fail(f"Cannot read {relative(path)}: {exc}")
            continue
        if path.suffix == ".html":
            html = HTMLResources()
            html.feed(text)
            for url in html.resources:
                resource(url, path)
            if "katex-error" in text or "KaTeX parse error" in text or "ParseError:" in text:
                fail(f"Math rendering error cue in {relative(path)}")
        elif path.suffix == ".css":
            for url in re.findall(r"url\(\s*([^)]*?)\s*\)", text):
                resource(url, path)
            for url in re.findall(r"@import\s+['\"]([^'\"]+)['\"]", text):
                resource(url, path)
        elif path.suffix == ".js" and "vendor" not in path.relative_to(dist).parts:
            for url in re.findall(r"\b(?:import|export)\s+(?:[^;\n]*?\s+from\s+)?['\"]([^'\"]+)['\"]", text):
                resource(url, path)
            for url in re.findall(r"\b(?:import|fetch)\s*\(\s*['\"]([^'\"]+)['\"]", text):
                resource(url, path)
            for url in re.findall(r"\b(?:src|poster)=[\"']([^\"']+)[\"']", text):
                resource(url, path)
            # Disallow remote runtime calls even when built from a template.
            if re.search(r"\b(?:fetch|import)\s*\(\s*[`'\"]https?://", text):
                fail(f"Remote runtime call in {relative(path)}")

    app = dist / "app.js"
    if app.is_file():
        source = app.read_text(encoding="utf-8")
        slugs = tuple(re.findall(r"\bfilm\s*:\s*['\"]([^'\"]+)['\"]", source))
        if slugs != EXPECTED_FILMS:
            fail(f"Expected six chapter film routes in order; found {slugs!r}")
        for kind, ext in (("films", "mp4"), ("posters", "jpg"), ("captions", "vtt")):
            if f"assets/{kind}/${{t.film}}.{ext}" not in source:
                fail(f"Missing dynamic {kind} route in app.js")
    else:
        fail("Missing app.js")

    ffprobe = args.ffprobe or shutil.which("ffprobe")
    if not ffprobe and Path("/opt/homebrew/bin/ffprobe").is_file():
        ffprobe = "/opt/homebrew/bin/ffprobe"
    if not args.skip_media and not ffprobe:
        fail("ffprobe is required for media verification; install it or supply --ffprobe.")

    def probe(path):
        if not ffprobe:
            return None
        try:
            result = subprocess.run(
                [ffprobe, "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
                capture_output=True, text=True, timeout=30, check=True,
            )
            return json.loads(result.stdout)
        except (OSError, ValueError, subprocess.SubprocessError) as exc:
            fail(f"ffprobe failed for {relative(path)}: {exc}")
            return None

    def timestamp(value):
        hours, minutes, seconds = value.split(":")
        return int(hours) * 3600 + int(minutes) * 60 + float(seconds)

    media_count = 0
    if not args.skip_media:
        for slug in EXPECTED_FILMS:
            paths = {kind: dist / "assets" / kind / f"{slug}.{extension}" for kind, extension in (("films", "mp4"), ("posters", "jpg"), ("captions", "vtt"))}
            for path in paths.values():
                if not path.is_file() or path.stat().st_size == 0:
                    fail(f"Missing or empty chapter media: {relative(path)}")
            film = paths["films"]
            metadata = probe(film) if film.is_file() else None
            duration = None
            if metadata:
                streams = metadata.get("streams", [])
                videos = [s for s in streams if s.get("codec_type") == "video"]
                audios = [s for s in streams if s.get("codec_type") == "audio"]
                try:
                    duration = float(metadata.get("format", {}).get("duration", 0))
                    if duration < 180:
                        fail(f"Film shorter than 180 seconds: {slug} ({duration:.2f}s)")
                except (TypeError, ValueError):
                    fail(f"Invalid film duration: {slug}")
                if len(videos) != 1:
                    fail(f"Expected one video stream: {slug}")
                else:
                    video = videos[0]
                    if (video.get("width"), video.get("height")) != (1920, 1080):
                        fail(f"Expected 1920×1080 video: {slug}")
                    if video.get("codec_name") != "h264":
                        fail(f"Expected H.264 video: {slug}")
                    try:
                        if Fraction(video.get("avg_frame_rate", "0/1")) != 30:
                            fail(f"Expected 30 fps: {slug} ({video.get('avg_frame_rate')})")
                    except (ValueError, ZeroDivisionError):
                        fail(f"Invalid video frame rate: {slug}")
                if not audios or any(a.get("codec_name") != "aac" for a in audios):
                    fail(f"Expected AAC audio: {slug}")
                media_count += 1

            poster = paths["posters"]
            if poster.is_file():
                picture = poster.read_bytes()
                if not picture.startswith(b"\xff\xd8") or not picture.endswith(b"\xff\xd9"):
                    fail(f"Poster is not a complete JPEG: {slug}")

            caption = paths["captions"]
            if caption.is_file():
                text = caption.read_text(encoding="utf-8-sig")
                if not text.startswith("WEBVTT"):
                    fail(f"Caption does not begin WEBVTT: {slug}")
                if re.search(r"\\(?:frac|cdot|text|begin|end)\b|katex-error|KaTeX parse error|ParseError:", text):
                    fail(f"Raw TeX or math error cue in captions: {slug}")
                cues = re.findall(r"(?m)^(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s*$", text)
                if not cues:
                    fail(f"No valid caption cues: {slug}")
                previous_end = 0.0
                for start, end in cues:
                    start, end = timestamp(start), timestamp(end)
                    if end <= start or start < previous_end - 0.001:
                        fail(f"Overlapping or backwards caption timing: {slug}")
                    if duration is not None and end > duration + 0.5:
                        fail(f"Caption extends beyond film: {slug}")
                    previous_end = end

    if errors:
        print(f"FAIL: {len(errors)} site verification issue(s)")
        for message in errors:
            print(f"  - {message}")
        return 1
    print(f"PASS: {len(checked)} source/runtime files verified; all local asset references resolve.")
    print("PASS: six chapter routes, local KaTeX assets and fonts; no remote runtime assets.")
    if args.skip_media:
        print("SKIPPED: film, poster and caption checks (--skip-media). Run again without this flag after rendering.")
    else:
        print(f"PASS: {media_count} films with ≥180s, 1920×1080, 30 fps, H.264/AAC; JPEG posters and WebVTT captions.")
    print("LIMIT: static checks do not verify visible math, film composition or interactive accessibility; complete browser/visual QA separately.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
