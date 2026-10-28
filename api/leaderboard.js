import { GHOST_COUNT } from '../lib/game-config.js';
import { sendJson } from '../lib/http.js';
import { getAllSubmissions, scoreAnswers } from '../lib/store.js';

// Scores are recalculated from saved answers on every request,
// so editing the answer key updates the leaderboard immediately.
export default async function handler(req, res) {
  const submissions = await getAllSubmissions();
  const rows = submissions
    .map((s) => ({
      player: s.player,
      correct: scoreAnswers(s.answers).correct,
      submittedAt: s.submittedAt,
    }))
    // Highest score first; ties go to whoever submitted earlier.
    .sort((a, b) => b.correct - a.correct || a.submittedAt - b.submittedAt);

  sendJson(res, 200, { total: GHOST_COUNT, rows });
}
