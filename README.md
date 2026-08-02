# Date Invitation

A cute, interactive, mobile-first date invitation with four steps:

1. A playful response to the invitation
2. Date and time selection
3. Food selection
4. A final summary with an option to save the invitation as an image

This project uses plain HTML, CSS, and JavaScript. It does not require React or a build step.

## Local Preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/invite/` in your browser.

## Deploying to GitHub Pages

This repository does not need a custom GitHub Actions workflow because the website is fully static. The invitation files are stored in the `invite/` directory, leaving the repository root available for future pages.

In your GitHub repository, configure Pages to publish directly from the `main` branch:

1. Open `Settings → Pages`.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Select the `main` branch and the `/(root)` folder.
4. Click **Save**.

GitHub Pages will deploy the site automatically after each push to `main`.

For this user-site repository, the invitation will be published at:

`https://mscslab.github.io/invite/`
