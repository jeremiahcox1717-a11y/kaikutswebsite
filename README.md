# Kai Kuts

Barbering site with a booking section. Photos, hours, prices, and shop info are placeholders until they come in.

## Files

- `index.html` — page structure and copy
- `styles.css` — layout and look
- `script.js` — navigation, calendar, time slots, booking
- `favicon.svg` — tab icon

Open `index.html` in a browser, or drop the folder on GitHub Pages.

## When his info arrives

1. **Shop details** — replace the placeholder lines in the Visit section of `index.html` (address, phone, Instagram).
2. **Name / bio** — update the hero, about copy, and page title in `index.html` if the shop name is not “Kai Kuts”.
3. **Hours, services, prices** — edit the `SHOP` object at the top of `script.js`. Hours drive which calendar days and time slots are open.
4. **Photos** — put files in an `images/` folder, then either:
   - add `data-image="images/hero.jpg"` on a `.photo-slot`, or
   - drop an `<img src="images/hero.jpg" alt="...">` inside the slot.

Booking requests currently save in the browser (`localStorage`) so the chair and calendar work before a real app is connected. Swap the submit handler later for Booksy, Square, a form service, or a phone/SMS confirm.
