# Code, Curiosity & Clarity — by Juliana Castro

## What is this?
A personalized weekly intelligence dashboard that automatically fetches news every week across AI, Consulting, Strategy, Industrial & Ops, and South Florida — and emails me a digest. Built with React + Vite.

## How everything connects

### GitHub Repository
`julicast11/code-curiosity-clarity` — this is where the dashboard code lives online. Think of it as a cloud backup of your project that also runs automations.

### Personal Access Token (Classic)
This is like a password specifically for your terminal to talk to GitHub. Instead of typing your GitHub password every time you push code, the token handles authentication. It has two permissions:
- **repo** — lets you push/pull code
- **workflow** — lets you push GitHub Actions workflow files (the automation that runs weekly)

### GitHub Actions Secrets
4 private values stored in the repo that the weekly automation uses:
- **GEMINI_API_KEY** — so the script can use Google's AI to enhance content (free)
- **GMAIL_USER** — your email address for sending
- **GMAIL_APP_PASSWORD** — the 16-character password Google gave you (lets the script send emails through Gmail without your real password)
- **RECIPIENT_EMAIL** — where the weekly email gets sent

### How it all works together
Every Monday at 6AM, GitHub Actions automatically:
1. Runs `generate.js` → fetches fresh news via RSS + Gemini AI
2. Runs `email.js` → sends a digest email to juli.castro11@gmail.com
3. Commits the new JSON files back to the repo

That's it! A free, automated, personal news service. ✨

## Tech stack
- React + Vite (frontend)
- rss-parser (news fetching)
- Google Gemini 2.0 Flash (AI summaries, free tier)
- Nodemailer (email delivery)
- GitHub Actions (weekly automation)

## Local development
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:5173

## Making changes
1. Open a terminal tab and run `npm run dev` (starts the live preview)
2. Open a second terminal tab and run `claude` (to chat and make edits)
3. See changes live in your browser
4. When done, stop the dev server with Ctrl+C and push:
