# Apogee 2026 registration site

A one-page registration site for **Apogee 2026**, a hypothetical 36-hour space-tech hackathon run by Infinity Space Club, UPES. Built as a design task: the event, dates, prizes and contacts are all placeholders.

![Apogee 2026 homepage](docs/preview.jpg)

**What's on the page:** event name and tagline, a live countdown to the registration deadline, About, Our mission, the problem statement (with two tracks, open datasets and judging criteria), prizes, and contact details. The **Register** button in the header, and every other register button, opens a registration popup.

Plain HTML, CSS and JavaScript. No frameworks, no build step, and it works on phones.

## Files

```
index.html        the page, including the registration popup
css/style.css     all styles
js/script.js      header, countdown, popup and form handling
assets/           star field, mountain ridges, icons
fonts/            Mona Sans and Hubot Sans (self-hosted, SIL Open Font License)
docs/preview.jpg  the screenshot above
```

## Run it on your computer

Double-click `index.html`, or serve the folder so it behaves exactly like the live site:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Connect the registration form

GitHub Pages only serves static files, so the form sends entries to [Formspree](https://formspree.io), a free form backend (the free plan allows 50 submissions a month).

1. Create a free account at formspree.io and confirm your email.
2. Create a new form, for example "Apogee 2026 registrations".
3. Copy the form's endpoint. It looks like `https://formspree.io/f/abcdwxyz`.
4. In `index.html`, find `https://formspree.io/f/YOUR_FORM_ID` and replace it with your endpoint.
5. Commit and push. Registrations now arrive in your inbox and in the Formspree dashboard.

Until you do this, the form runs in **demo mode**: it validates and shows the success screen, but sends nothing, and says so on screen.

Each entry includes the team name, track, team size, the leader's name, email, phone, college and year, every teammate's name and email, and a reference code such as `APG-7K3M` that the team also sees on screen.

## Change the event details

| What | Where |
| --- | --- |
| Registration deadline for the countdown | `data-deadline` on the `.countdown` element in `index.html` |
| Dates, venue, prizes, contacts | The text in `index.html` |
| Colours and fonts | The variables at the top of `css/style.css` |
| Footer note saying this is a concept site | `.site-footer__note` in `index.html` |

After the deadline passes, the countdown switches to "Registrations have closed" and the register buttons turn off automatically.

Tip: a link ending in `#register` (for example in an Instagram bio) opens the registration popup straight away.

## Put it online with GitHub Pages

1. Push this folder to a **public** GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick the `main` branch and the `/ (root)` folder, then **Save**.
5. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

Every later push to `main` updates the live site automatically.

## Credits

Fonts: [Mona Sans](https://github.com/github/mona-sans) and [Hubot Sans](https://github.com/github/hubot-sans) by GitHub, under the SIL Open Font License (licences in `fonts/`). Illustrations, mountains, star field and mission patch are original to this project.
