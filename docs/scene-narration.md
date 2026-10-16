# Scene narration

The game has one host briefing per phase: `briefing`, `evidence`, `question`,
`vote`, and `result`. The four built-in cases each have Chinese and English
recordings. Paragraph-level narration buttons and their runtime synthesis
requests are no longer part of the player interface.

## Updating recordings

1. Edit the approved case copy in `public/app.js` or the summary composition in
   `scripts/build-scene-narration.mjs`.
2. Run `npm run audio:build-summaries`.
3. Run `npm run audio:produce-summaries` with `ADMIN_REVIEW_TOKEN` supplied through
   the environment or a protected standard-input stream. Never commit a token.
   `NARRATION_API_BASE` optionally selects another configured backend.
4. Run `npm run check` before publishing. Commit the generated manifests and
   `public/assets/narration/` together with the UI change.

The producer uses the existing authenticated Azure Speech generation endpoint.
Summary keys and file names include a text hash, so changed scripts do not reuse
old recordings. Existing matching recordings are reused on a rerun. Published
character monologues are also downloaded into the application bundle.

The player loads these files from the same origin as the application. Playback
does not need a database request, a synthesis request, or an administrator key.
Remote catalogs remain available for newly published character monologues and
imported cases. Missing monologues are clearly disabled rather than triggering
an unavailable generation route.

## Playback and story boundaries

- Play/pause/resume, seeking and retry use one shared media element.
- Changing phase, language or leaving the game stops the current recording.
- Room UI refreshes retain playback within the same phase and language.
- Background music is reduced while narration is playing.
- Summaries before the result phase only cover public setup and instructions.
  The solution timeline is shown and narrated only during the final recap.
- The local server provides audio content types, content lengths and byte ranges
  so browsers can display duration and seek correctly.

Validation: `npm run check` checks manifest consistency and the presence of all
40 summary files. Browser checks cover Chinese/English playback, pause/resume,
seek, phase/language changes, and character playback. The bundled MP3 files
were also decoded with ffprobe and checked through the local HTTP server.
