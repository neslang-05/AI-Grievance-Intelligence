# Azure App Service Deployment (GitHub Actions)

This document describes how to deploy the Next.js standalone build to Azure App Service using GitHub Actions.

Prerequisites

- Create an Azure Web App (Linux) to host the Node.js app.
- Obtain the web app Publish Profile and save it as the repository secret `AZURE_WEBAPP_PUBLISH_PROFILE`.
- Save the target app name as the repository secret `AZURE_WEBAPP_NAME`.

What we changed

- Enabled `output: 'standalone'` in `next.config.js` so `next build` produces a self-contained server in `.next/standalone`.
- Added GitHub Actions workflow: `.github/workflows/main_aicivicintelligence.yml` which builds, prepares, and deploys the standalone artifact.

Required Azure App Settings (set in Azure Portal → Configuration)

- `WEBSITE_RUN_FROM_PACKAGE = 1` (recommended)
- `SCM_DO_BUILD_DURING_DEPLOYMENT = false`
- `PORT = 8080` (recommended; App Service uses 8080 inside container)

How the workflow works

1. Checks out the repo and sets Node 20.
2. Runs `npm ci --legacy-peer-deps` and `npm run build` (Next.js produces `.next/standalone`).
3. Installs production dependencies inside `.next/standalone`.
4. Copies `public/` and `.next/static` into the standalone folder.
5. Zips the standalone folder and deploys it using `azure/webapps-deploy@v3` with the publish profile.

Secrets to configure in GitHub

- `AZURE_WEBAPP_PUBLISH_PROFILE` — contents of the Publish Profile (XML) from Azure Portal.
- `AZURE_WEBAPP_NAME` — name of the target web app.

Optional: Using `az` to set App Settings from CI
If you prefer to set the App Settings from CI, create an Azure service principal and add `AZURE_CREDENTIALS` to GitHub, then use `azure/login@v1` and `az webapp config appsettings set` to apply the required settings.

Notes

- Standalone builds include a `server.js` entrypoint. The App Service startup command should be `node server.js` when using the unpacked standalone content. When deploying the zipped package with `WEBSITE_RUN_FROM_PACKAGE=1`, Azure will run the package directly.
- If you choose a different deployment strategy (non-standalone), update the workflow accordingly.
