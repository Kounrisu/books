#!/usr/bin/env python3
"""Local, offline cover-photo recognition for the books app's zip backup.

Reads a books-export.zip (from the app's "Full local backup" download),
runs OCR (Tesseract, via pytesseract) against each book's cover photo, and
writes a new zip with guessed title/author filled in for books still marked
"needs_metadata" -- ready to feed back into the app's "Import backup" button.

This is a local/on-device alternative to the cloud vision-API cover
recognition the product spec originally described (see
docs/superpowers/specs/2026-09-13-books-library-design.md). OCR reads text
printed on a cover; it does not identify the book the way a vision model
would, so results are guesses -- books it touches are marked
"needs_review", not "complete".

Requires the Tesseract OCR engine installed separately (not a pip package):
  - macOS:   brew install tesseract
  - Ubuntu:  sudo apt install tesseract-ocr
  - Windows: https://github.com/UB-Mannheim/tesseract/wiki

Usage:
  python recognize.py books-export.zip
  python recognize.py books-export.zip --out books-export-recognized.zip
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
import zipfile
from pathlib import Path

try:
    import pytesseract
    from PIL import Image
except ImportError as exc:  # pragma: no cover - guidance for the user, not app logic
    sys.exit(f"Missing dependency: {exc}\nInstall with: pip install -r requirements.txt")


def guess_title_and_author(text: str) -> tuple[str | None, str | None]:
    """Very rough heuristic: the longest line is probably the title; the
    next-longest reasonably-sized line is probably the author. Book covers
    vary too much for anything more precise without a real vision model."""
    lines = [re.sub(r"\s+", " ", line.strip()) for line in text.splitlines()]
    lines = [line for line in lines if len(line) >= 3]
    if not lines:
        return None, None

    by_length = sorted(lines, key=len, reverse=True)
    title = by_length[0]
    author = next((line for line in by_length[1:] if line != title), None)
    return title, author


def process(zip_path: Path, out_path: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        with zipfile.ZipFile(zip_path) as archive:
            archive.extractall(tmp_dir)

        metadata_path = tmp_dir / "books.json"
        if not metadata_path.exists():
            sys.exit(f"{zip_path} does not look like a books-export.zip (no books.json inside)")

        data = json.loads(metadata_path.read_text(encoding="utf-8"))
        books = data.get("books", [])

        updated = 0
        for book in books:
            if book.get("metadataStatus") != "needs_metadata":
                continue
            photo_rel_path = book.get("coverPhotoInZip")
            if not photo_rel_path:
                continue
            photo_path = tmp_dir / photo_rel_path
            if not photo_path.exists():
                continue

            text = pytesseract.image_to_string(Image.open(photo_path))
            title, author = guess_title_and_author(text)
            if not title:
                continue

            book["title"] = title
            if author:
                book["author"] = author
            if not book.get("description"):
                book["description"] = f"OCR guess from cover text:\n{text.strip()}"
            book["metadataStatus"] = "needs_review"
            updated += 1

        metadata_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

        if out_path.exists():
            out_path.unlink()
        with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as archive:
            for file_path in tmp_dir.rglob("*"):
                if file_path.is_file():
                    archive.write(file_path, file_path.relative_to(tmp_dir))

    print(f"Guessed title/author for {updated} book(s).")
    print(f"Wrote {out_path} -- import this back into the app.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip_path", type=Path, help="Path to books-export.zip")
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output zip path (default: <input>-recognized.zip)",
    )
    args = parser.parse_args()

    if not args.zip_path.exists():
        sys.exit(f"File not found: {args.zip_path}")

    out_path = args.out or args.zip_path.with_name(args.zip_path.stem + "-recognized.zip")
    process(args.zip_path, out_path)


if __name__ == "__main__":
    main()
