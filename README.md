# CrystalSteps Studio

Static site for [crystalsteps.net](https://www.crystalsteps.net/), published with GitHub Pages from the repository root. `CNAME` stays in place so the custom domain keeps working.

The site presents two apps, Clariguiz and Monumente. English is the default. Italian, French, and Spanish are separate folders.

## Pages

| Path | Page |
| --- | --- |
| `/` | Studio home |
| `/clariguiz.html` | Clariguiz |
| `/monumente.html` | Monumente |
| `/privacy_clariguiz.html` | Clariguiz privacy policy |
| `/privacy.html` | Monumente privacy policy and terms |
| `/it/`, `/fr/`, `/es/` | The same pages in Italian, French, and Spanish |
| `/404.html` | Missing-page fallback |

## Languages

Each language is real HTML, not a JavaScript translation layer. The language switcher is a row of links to the same page in another folder:

- English lives at the site root (`/`, `/clariguiz.html`, …)
- Italian lives in `/it/`
- French lives in `/fr/`
- Spanish lives in `/es/`

A switch on `/fr/monumente.html` goes to `/monumente.html`, `/it/monumente.html`, or `/es/monumente.html`. Titles, descriptions, and visible copy are already in that language, so the pages work with JavaScript disabled.

Privacy and terms stay in English on every language. The surrounding page (title, navigation, footer, and a short note) is translated. Product pages link to the privacy page in the same language.

## Editing copy

Marketing text for all four languages is in `content/copy.json`. The English legal text is in:

- `content/privacy-clariguiz.html`
- `content/privacy-monumente.html`

After editing, regenerate the HTML files:

```bash
node scripts/build.mjs
```

Commit the source and the generated HTML. GitHub Pages serves the HTML as-is and does not run the build.

Icons and screenshots in `assets/images/` are the public App Store artwork for Clariguiz and Monumente.
