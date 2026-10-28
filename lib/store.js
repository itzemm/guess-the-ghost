import { Redis } from '@upstash/redis';
import { ANSWER_KEY, GHOST_COUNT } from './game-config.js';

const KEY = 'ghost-game:submissions';

// Vercel's Upstash integration may name the variables either way.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Without a database configured (e.g. local testing) fall back to memory.
// On Vercel this would lose data, so we warn loudly.
const memory = new Map();
if (!redis) {
  console.warn('[ghost-game] No Redis configured — using in-memory storage (data is not saved).');
}

export const normalizeName = (name) => name.trim().toLowerCase();

// Saves only if the player name is unused. Returns false if it's taken.
export async function saveSubmission(submission) {
  const id = normalizeName(submission.player);
  if (!redis) {
    if (memory.has(id)) return false;
    memory.set(id, submission);
    return true;
  }
  return (await redis.hsetnx(KEY, id, JSON.stringify(submission))) === 1;
}

export async function getAllSubmissions() {
  if (!redis) return [...memory.values()];
  const all = (await redis.hgetall(KEY)) ?? {};
  return Object.values(all).map((v) => (typeof v === 'string' ? JSON.parse(v) : v));
}

export function scoreAnswers(answers) {
  let correct = 0;
  const results = {};
  for (let i = 1; i <= GHOST_COUNT; i++) {
    const ok = answers[i] != null && answers[i] === ANSWER_KEY[i];
    results[i] = ok;
    if (ok) correct++;
  }
  return { correct, results };
}
