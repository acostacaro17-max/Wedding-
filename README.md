# Carolina & Antanas — Wedding Website

A static one-page site: `index.html`, `styles.css`, `script.js`. It has no build step, so you can open `index.html` in a browser or host it on GitHub Pages.

## Updating details
Open the `CONFIG` block at the top of `script.js` and fill in dates, times, venues and the RSVP deadline as they're confirmed. Empty values keep the placeholder text.

## RSVP
Set **one** of these in `CONFIG`:
- `rsvpEndpoint`: a form service URL (e.g. a free [Formspree](https://formspree.io) form). Responses arrive by email.
- `rsvpEmail`: opens the guest's email app with their answers already filled in.

## Publishing on GitHub Pages
Go to Settings → Pages, choose "Deploy from a branch", then pick the branch and `/ (root)`.
