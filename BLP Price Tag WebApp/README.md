# BLP Showroom Price Tag Maker

One-page webapp for the showroom team: fill in a short worksheet, get a
print-ready PDF price tag matching the official template
("OFFICIAL: Piano Tag - No Rent Price").

## How to use (team workflow)

1. Walk the floor, photograph the serial number of any piano missing a tag.
2. Look the piano up in the [Piano Log](https://docs.google.com/spreadsheets/d/1ZunbPKygpQlcXfTyPowDHdUE9spJ3uV1XA4iX1eoKRc/edit)
   (link is in the app header).
3. Fill in: make/model line, warranty, Brigham's Price, optional MSRP
   (Piano Buyer lookup link in the app), serial #, and the YouTube video URL
   for the QR code.
4. The monthly finance payment is calculated automatically:
   (price + 7.45% tax + delivery + bench − down payment) amortized at
   10.99% APR over 60 payments — same math as the financing calculator
   spreadsheet. Defaults are adjustable under "Financing settings."
5. Click **Download / Print PDF** → choose *Save as PDF* or print directly.
   Tag prints at 4.6″ × 7.4″; cut along the black border.
   The default **Tag + price arrow** layout adds the cut-out "$187/mo."
   arrow sign above the tag on the same page. Choose "1 tag per page" for
   just the tag, or "2 copies per page" for the landscape 2-up sheet.
6. **Double-sided** option: adds a second page with a QR code that opens the
   piano's data card on the [Store Map](https://blpstoremap.netlify.app/)
   (`#piano=SERIAL` deep link — needs the Serial #). Back side is logo-free
   to save ink (team-facing). In the print dialog turn on two-sided printing:
   *flip on long edge* for tag + arrow and 1-per-page, *flip on short edge*
   for the 2-up sheet, so backs come out right-side up. In arrow layout the
   back arrow outline is mirrored so the cut-out sign reads from both sides.

## Tech notes

- Single self-contained `index.html` — logos, QR generator (qrcodejs), and all
  styles are embedded. Works offline; host anywhere or open from disk.
- Prefill via URL params (for linking from the Piano Log):
  `?model=...&warranty=...&price=...&msrp=...&serial=...&video=...`
  Add `&duplex=1` for the double-sided Store Map QR back.
  Add `&print=arrow` (or `&print=1` / `&print=2`) to pre-populate the print
  sheet — used for headless PDF export:
  `chrome --headless --no-pdf-header-footer --print-to-pdf=tag.pdf "<url>"`
- Local preview: `python3 -m http.server 8902 --directory "BLP Price Tag WebApp"`
