# Guess the Ghost 👻

A guessing game: players look at the eyes of 12 ghosts, pick each ghost's name from a dropdown, and submit. Scores go on a shared leaderboard.

## Setting up your game

1. **Images:** put your images in `public/images/` and name them `ghost-1.jpg`, `ghost-2.jpg`, … `ghost-12.jpg`. (`.jpeg`, `.png` and `.webp` work too.) A wide image shape (16:9) looks best. Until an image is added, a placeholder pair of eyes is shown.
2. **Names and answers:** edit `lib/game-config.js`:
   - `NAME_CHOICES` is the list of names shown in every dropdown. Add extra decoy names to make the game harder.
   - The answer key is the correct name for each ghost. Players can't see it on the website, but **if your GitHub repository is public, anyone can read it on GitHub**. To keep the real answers secret, leave placeholder answers in this file and add them in Vercel instead: **Settings → Environment Variables**, name `GHOST_ANSWERS`, value = the 12 names in order separated by commas (e.g. `Casper, Slimer, ...`). Redeploy after changing it.
   - `SUBMISSIONS_OPEN` set to `false` stops new entries.
   - `SHOW_RESULTS_TO_PLAYERS` set to `true` shows players which ghosts they got right (this gives away the answers).

The leaderboard recalculates scores from saved answers every time it loads, so you can fix the answer key at any point.

## Run it on your computer

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Locally, scores are kept in memory and disappear when you stop the server.

## Publish on GitHub and Vercel

1. Push this folder to a new GitHub repository.
2. On [vercel.com](https://vercel.com), click **Add New → Project** and import the repository. Keep the default settings and click **Deploy**.
3. Add a database for the leaderboard: in the Vercel project, open **Storage → Create Database → Upstash (Redis)**, choose the free plan, and connect it to this project. This adds the database settings to the project for you.
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the site picks up the database.

From then on, every push to GitHub updates the site automatically.

## Rules

- Each player name can only be used once (capital letters are ignored, so "Alice" and "alice" count as the same name).
- Each name can only be picked for one ghost.
- Players with the same score are ranked by who submitted first.

## Clearing the leaderboard

Open the Upstash database from Vercel's Storage tab, go to its **Data Browser**, and delete the key `ghost-game:submissions`.
