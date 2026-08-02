# Romantic Static Pages

This repository contains two mobile-first, static Persian pages:

- `invite/`: a cute, interactive date invitation with four steps
- `apology/`: a gentle apology questionnaire that sends each submitted answer separately

The invitation includes:

1. A playful response to the invitation
2. Date and time selection
3. Food selection
4. A final summary with an option to save the invitation as an image

Both pages use plain HTML, CSS, and JavaScript. They do not require React or a build step.

## Local Preview

```bash
python3 -m http.server 4173
```

Then open one of these URLs in your browser:

- `http://localhost:4173/invite/`
- `http://localhost:4173/apology/`

## Deploying to GitHub Pages

This repository does not need a custom GitHub Actions workflow because the pages are fully static. Each page is stored in its own directory, leaving the repository root available for future pages.

In your GitHub repository, configure Pages to publish directly from the `main` branch:

1. Open `Settings → Pages`.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Select the `main` branch and the `/(root)` folder.
4. Click **Save**.

GitHub Pages will deploy the site automatically after each push to `main`.

For this user-site repository, the pages will be published at:

- `https://mscslab.github.io/invite/`
- `https://mscslab.github.io/apology/`
