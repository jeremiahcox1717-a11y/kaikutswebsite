# Kai Kuts

Precision-fade barbering site for **Kai Kuts** (`@kai.kut.it`). Dark navy and gold, a rotating fade gallery, and an appointment form.

## Files

- `index.html` — page structure and copy
- `styles.css` — luxury shop look
- `script.js` — fading gallery, navigation, calendar, time slots, booking
- `images/` — cut photos used in the hero and work rotators
- `favicon.svg` — tab icon

Open `index.html` in a browser, or drop the folder on GitHub Pages.

## When shop details arrive

1. **Address / phone** — Visit section in `index.html`.
2. **Hours, services, prices** — `SHOP` object at the top of `script.js`.
3. **Photos** — add files to `images/` and entries to the `GALLERY` array in `script.js`.

Booking requests currently save in the browser (`localStorage`). Swap the submit handler later for Booksy, Square, or a phone/SMS confirm.
