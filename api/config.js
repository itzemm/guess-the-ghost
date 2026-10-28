import { GHOST_COUNT, NAME_CHOICES, SUBMISSIONS_OPEN } from '../lib/game-config.js';
import { sendJson } from '../lib/http.js';

// Public game settings. Never include the answer key here.
export default function handler(req, res) {
  sendJson(res, 200, {
    ghostCount: GHOST_COUNT,
    names: NAME_CHOICES,
    submissionsOpen: SUBMISSIONS_OPEN,
  });
}
