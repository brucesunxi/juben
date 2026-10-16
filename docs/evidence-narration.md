# Clue narration

Each opened evidence card has one narration player for its title, source/type and detail. It uses the same single-audio lifecycle as scene briefings and role monologues: playing a clue stops other speech, closing the clue stops its audio, and switching language stops the old recording. Pinning a clue preserves playback.

The 24 built-in clues have 48 pre-generated Azure Neural recordings (Chinese and English). The static files are served locally without a live synthesis request. No browser speech fallback is used. New/imported clues without recordings show an unavailable state instead of a misleading play button.

After editing clue text:

1. Run `npm run audio:build-clues` to build the versioned manifest.
2. Run `npm run audio:produce-clues` with the administrator credential in `ADMIN_REVIEW_TOKEN` or protected stdin. The producer reuses identical published recordings, rate-limits synthesis, and downloads missing files. Never commit credentials.
3. Run `npm run check`. This verifies manifest/text parity and all expected audio files.

The player reads `public/evidence-narration.js`. Filenames include a text hash to avoid stale recordings. Narration contains only the current clue, not the solution or unrevealed clues. Both languages use the existing host voices (Yunjian / Guy).

Verification: all 48 recordings decoded as MP3, have positive duration, and returned valid HTTP 206 byte ranges locally. Browser checks covered Chinese and English playback, pause/replay, seeking, language switching and closing the dialog.
