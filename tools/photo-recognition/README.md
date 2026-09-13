# Local cover-photo recognition

A standalone script that guesses `title`/`author` for books still marked
"needs metadata" by running OCR against their cover photo — entirely
offline, with no cloud API calls or per-request cost. It's meant to run
against the zip produced by the app's Books → Import/Export page
("Full local backup (photos + metadata)").

This is a deliberate local alternative to the cloud vision-API cover
recognition originally sketched in the product spec. OCR reads text
printed on a cover; it doesn't identify the exact edition the way a vision
model would, so treat its output as a starting guess, not a confirmed
match — books it touches are marked `needs_review` so you know to check
them.

## Setup

1. Install the Tesseract OCR engine (a system binary, not a Python package):
   - macOS: `brew install tesseract`
   - Ubuntu/Debian: `sudo apt install tesseract-ocr`
   - Windows: https://github.com/UB-Mannheim/tesseract/wiki

2. Install the Python dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. In the app, go to Books → Import/Export and click "Download backup (.zip)"
   under "Full local backup (photos + metadata)".
2. Run the script against the downloaded file:
   ```
   python recognize.py ~/Downloads/books-export.zip
   ```
   This writes `books-export-recognized.zip` next to it (or pass `--out` for
   a different path).
3. Back in the app, use "Choose backup .zip" / "Import backup" under the same
   section to import `books-export-recognized.zip`. Books it guessed at will
   come back with `needs_review` status — check them and correct anything the
   OCR got wrong.
