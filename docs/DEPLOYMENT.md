# Deployment Guide

## Deploying to Vercel

This project is a React application built with Vite. It requires environment variables to connect to its backend services (Supabase and your custom API).

### Prerequisites

1.  A [Vercel](https://vercel.com) account.
2.  The project pushed to a GitHub repository.

### Steps

1.  **Import Project**:
    - Log in to Vercel.
    - Click **"Add New..."** > **"Project"**.
    - Import your GitHub repository `{YOUR-REPO}`.

2.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Vite**. If not, select it manually.
    - **Root Directory**: Leave as `./`.
    - **Build Command**: `npm run build` (or default).
    - **Output Directory**: `dist` (or default).

3.  **Environment Variables**:
    - Expand the **"Environment Variables"** section.
    - Add the following variables (values should match your production backend):

    | Key | Description | Example Value |
    | :--- | :--- | :--- |
    | `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://xyz.supabase.co` |
    | `VITE_SUPABASE_ANON_KEY` | Your Supabase Anonymous Key | `sb_publishable_...` |
    | `VITE_API_URL` | URL of your backend API | `https://api.example.com` |

4.  **Deploy**:
    - Click **"Deploy"**.
    - Wait for the build to complete.

### Verifying Deployment

- Once deployed, Vercel will provide a URL (e.g., `https://scraperbase.vercel.app`).
- Visit the URL and check:
    - Does the app load without errors?
    - Check the browser console for any connection errors to Supabase or the API.
    - Verify that the "Server Status" in the top bar (if visible) connects correctly.

### Troubleshooting

- **404 on Refresh**: If you see a 404 error when refreshing a page other than the home page, ensure `vercel.json` is present in the root directory with the rewrite rule to `index.html`.
- **Connection Errors**: Double-check that you added the Environment Variables correctly in the Vercel dashboard. You may need to redeploy after adding them.
