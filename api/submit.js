import {
  GHOST_COUNT,
  NAME_CHOICES,
  SUBMISSIONS_OPEN,
  SHOW_RESULTS_TO_PLAYERS,
} from '../lib/game-config.js';
import { sendJson, readBody } from '../lib/http.js';
import { saveSubmission, scoreAnswers } from '../lib/store.js';

const MAX_NAME_LENGTH = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST.' });
  if (!SUBMISSIONS_OPEN) return sendJson(res, 403, { error: 'Submissions are closed.' });

  const body = readBody(req);
  if (!body || typeof body !== 'object') return sendJson(res, 400, { error: 'Invalid request.' });

  const player = typeof body.player === 'string' ? body.player.trim().replace(/\s+/g, ' ') : '';
  if (!player) return sendJson(res, 400, { error: 'Please enter your name.' });
  if (player.length > MAX_NAME_LENGTH) {
    return sendJson(res, 400, { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` });
  }

  const raw = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const answers = {};
  for (let i = 1; i <= GHOST_COUNT; i++) {
    const guess = raw[i];
    if (!guess) return sendJson(res, 400, { error: `Please pick a name for Ghost ${i}.` });
    if (!NAME_CHOICES.includes(guess)) {
      return sendJson(res, 400, { error: `"${guess}" is not a valid choice for Ghost ${i}.` });
    }
    answers[i] = guess;
  }

  const saved = await saveSubmission({ player, answers, submittedAt: Date.now() });
  if (!saved) {
    return sendJson(res, 409, {
      error: `Someone named "${player}" has already played. Please use a different name.`,
    });
  }

  const { correct, results } = scoreAnswers(answers);
  sendJson(res, 200, {
    player,
    correct,
    total: GHOST_COUNT,
    ...(SHOW_RESULTS_TO_PLAYERS ? { results } : {}),
  });
}
