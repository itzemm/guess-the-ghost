// ============================================================
//  GAME SETTINGS — edit this file to set up your game.
//  This file only runs on the server, so players never see
//  the answer key.
// ============================================================

// Number of ghosts in the game. Images go in public/images/ghost-1.jpg ... ghost-12.jpg
export const GHOST_COUNT = 12;

// The names players can choose from in every dropdown.
// Add extra "decoy" names here if you want to make it harder.
export const NAME_CHOICES = [
  'Name A',
  'Name B',
  'Name C',
  'Name D',
  'Name E',
  'Name F',
  'Name G',
  'Name H',
  'Name I',
  'Name J',
  'Name K',
  'Name L',
];

// The correct answer for each ghost number. Each value must match
// one of NAME_CHOICES exactly. You can change these at any time:
// scores on the leaderboard are recalculated from saved answers.
//
// IMPORTANT: if your GitHub repository is public, anyone can read this file.
// Keep the real answers secret by setting them in Vercel instead:
//   Project → Settings → Environment Variables → add GHOST_ANSWERS
//   with the 12 names in order, separated by commas, e.g.
//   Name A, Name B, Name C, Name D, Name E, Name F, Name G, Name H, Name I, Name J, Name K, Name L
// When GHOST_ANSWERS is set, it is used instead of the list below.
const DEFAULT_ANSWER_KEY = {
  1: 'Name A',
  2: 'Name B',
  3: 'Name C',
  4: 'Name D',
  5: 'Name E',
  6: 'Name F',
  7: 'Name G',
  8: 'Name H',
  9: 'Name I',
  10: 'Name J',
  11: 'Name K',
  12: 'Name L',
};

export const ANSWER_KEY = process.env.GHOST_ANSWERS
  ? Object.fromEntries(process.env.GHOST_ANSWERS.split(',').map((name, i) => [i + 1, name.trim()]))
  : DEFAULT_ANSWER_KEY;

// Set to false to stop accepting new submissions (the leaderboard stays visible).
export const SUBMISSIONS_OPEN = true;

// Set to true to show players which ghosts they got right after submitting
// (this reveals answers, so it's best turned on only after the game ends).
export const SHOW_RESULTS_TO_PLAYERS = false;
