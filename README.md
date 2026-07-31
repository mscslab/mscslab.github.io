# Date Invitation for GitHub Pages

A cute, interactive, mobile-first date invitation with four steps:

1. A playful response to the invitation
2. Date and time selection
3. Food selection
4. A final summary with an option to save the date to a calendar

This project uses plain HTML, CSS, and JavaScript. It does not require React or a build step.

## Local Preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173` in your browser.

## Deploying to GitHub Pages

Every push to the `main` branch triggers the
`.github/workflows/pages.yml` workflow, which deploys the website directly from the repository root.

In your GitHub repository, set the Pages deployment source to GitHub Actions:

`Settings → Pages → Build and deployment → Source → GitHub Actions`
