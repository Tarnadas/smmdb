# AGENTS.md

Guidance for AI agents and humans working in this repository.

## Self-hosting checklist

This project is designed to be self-hostable. When you change deployment-related code,
keep the following working and documented (see `docs/SELFHOSTING.md`):

1. **No hardcoded secrets.** Search the repo for real-looking credentials
   (`AKIA...`, `'123'` cookie keys, hardcoded OAuth client IDs, API keys, passwords)
   before committing. Secrets must come from environment variables.
2. **Environment variables** used by the runtime (`MONGODB_URI`, `PORT`,
   `GOOGLE_CLIENT_ID`, `COOKIE_SECRET`, `DISCORD_TOKEN`) must stay documented in
   `docs/SELFHOSTING.md` and must not be baked into artifacts that ship.
3. **Client vs server env.** `webpack.EnvironmentPlugin` bakes values at build time.
   `GOOGLE_CLIENT_ID` must be baked into the *client* bundle (browsers have no env) via
   `config/webpack.*-client.js` / `webpack.ver.js` client block, while the *server* reads
   it at runtime (`src/server/index.ts:74`). Keep it out of server `EnvironmentPlugin`s.
4. **No domain-specific hardcodes.** Domain names, analytics IDs, and site-verification
   meta tags must not be hardcoded. If you see `smmdb.net`, `plausible.io`,
   `google-site-verification`, or a Google OAuth client ID in source/static files, it is
   a bug — remove it or make it env-driven.
5. **Docker build args.** Any env the client needs at build time (e.g. `GOOGLE_CLIENT_ID`)
   must also be exposed as a `ARG`/`--build-arg` in the `Dockerfile`, not just the runtime
   `environment:` block of `docker-compose.yml`.
6. **Secrets not tracked.** `.mongorc.json` (MEGA backup creds), `config/credentials*`,
   and the `db/` restore dump must stay gitignored.
7. **Backup sanitization.** The production mongodump contains PII (plaintext emails,
   Google IDs, API keys, ID tokens in `accounts`; AWS access keys in `amazon`
   `detailPageURL`). Any shared/redistributed backup must be run through
   `scripts/sanitize-backup.js` (drops `accounts` and `amazon` collections).

## Quick commands

- Build: `yarn build` (client + server, production). Set `GOOGLE_CLIENT_ID` first.
- Dev: `yarn watch` (webpack watch) + `yarn start:server` (nodemon).
- Lint: `yarn lint` (eslint `src/`).
- Typecheck (after edits): `npx tsc --noEmit` or `yarn build`.
- Test: `yarn test-server` (jest spec).
- Backup: `yarn backup` (uses `.mongorc.json`).
- Sanitize a shared dump: `node scripts/sanitize-backup.js <in-dump> <out-dump>`.

## Tech notes

- Stack: Node 16, Express 4, MongoDB 3.4 (driver `mongodb` ^2.2), React 16 + Redux,
  TypeScript 3, webpack 4.
- Build matrix: 8 webpack configs in `config/` (dev/prod/ver x server/client, plus
  gen-store, test-server, similarity). `config/environment.js` holds `dev`/`ver`/`prod`
  blocks for `port`, `domain`, `apiDomain` (baked at build).
- Server entry: `src/server/index.ts`; routes: `src/server/routes/index.ts`
  (only `/net64/portcheck`); DB layer: `src/server/Database.ts`.
- API dispatch: `src/server/scripts/api.ts` (`/api/:apicall`, and the `/api/v2` router).
- Similarity service: `src/similarity/index.ts` (separate build target).
- Course protobufs: `smm-protobuf` (git dep); save editor: `cemu-smm`/`cemu-smmdb`.
