# Self-hosting SMMDB

This document explains how to run your own SMMDB instance. It was written after the
original `smmdb.net` was shut down, so all configuration is now driven by environment
variables instead of the old hardcoded deployment values.

## What you need

- Node.js 16+ and yarn 1.x (for building from source)
- MongoDB 3.4+ (4.x works; the app uses the `mongodb` 2.x driver)
- A Google Cloud project with an OAuth 2.0 Client ID (for Google sign-in)
- A domain (optional, only if you want public access)

## 1. Google OAuth setup

Login is done exclusively through Google (`/tokensignin` verifies a Google ID token
server-side). You need an OAuth 2.0 Client ID:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID of type *Web application*
3. Authorized JavaScript origins: `https://your.domain` (and `http://localhost:3000` for dev)
4. Authorized redirect URIs: leave empty (this app uses the Google Identity JS button, no redirect)

The client ID is needed in **two** places:

- **Client bundle (baked at build time)** — `LoginButton.tsx` renders the Google button
  with `clientId={process.env.GOOGLE_CLIENT_ID || ''}`. Browsers have no environment, so
  this value is baked into the JS bundle by webpack's `EnvironmentPlugin`. Set the
  `GOOGLE_CLIENT_ID` env var when running `yarn build`.
- **Server (read at runtime)** — `src/server/index.ts:74` reads `process.env.GOOGLE_CLIENT_ID`
  when verifying the returned ID token. Set it in your service's environment.

## 2. Configuration

The build system still reads `config/environment.js` for `DOMAIN`, `API_DOMAIN` and `PORT`
which are baked into the bundle. Edit the `prod` block if you run a production build:

```js
// config/environment.js
prod: {
  port: 3000,
  domain: 'https://your.domain/',
  apiDomain: 'https://your.domain/' // same as domain unless you split out courses2
}
```

Runtime environment variables (no rebuild required):

| Variable          | Required | Default              | Purpose                                    |
| ----------------- | -------- | -------------------- | ------------------------------------------ |
| `MONGODB_URI`     | no       | `mongodb://localhost:27017` | MongoDB connection string           |
| `PORT`            | no       | `3000`               | HTTP listen port                           |
| `GOOGLE_CLIENT_ID`| yes      | —                    | OAuth client ID (server-side verification) |
| `COOKIE_SECRET`   | no       | `123`                | cookie-session signing key — set something random in production |
| `DISCORD_TOKEN`   | no       | —                    | Discord bot token (feature disabled)       |

## 3. Building

```bash
# install dependencies
yarn install

# build client + server (production). Set GOOGLE_CLIENT_ID so the button renders.
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com yarn build
```

`yarn build` runs `build:client` and `build:server` (webpack). Output goes to `build/`.

## 4. Running

```bash
export MONGODB_URI=mongodb://localhost:27017
export GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
export COOKIE_SECRET=$(openssl rand -hex 32)
node build/server
```

The server listens on `PORT` (default 3000).

## 5. Docker

A `docker-compose.yml` is provided for the common case:

```bash
docker compose up --build -d
```

It starts:

- `mongo` — MongoDB 3.4 with a persistent volume
- `web` — built from the root `Dockerfile`

The `web` service reads `GOOGLE_CLIENT_ID` and `COOKIE_SECRET` from its `environment`
block. **Important:** the client bundle bakes `GOOGLE_CLIENT_ID` at build time, so for a
fully working login button you must pass it to the build step as well:

```bash
docker compose build --build-arg GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com web
```

Note: `DOMAIN`/`API_DOMAIN` are baked from `config/environment.js` at build time. If you
change your domain later, rebuild.

## 6. Importing course data

The original operator can supply a mongodump (the final backup). Restore it before first
start so `mongorestore` doesn't race the app:

```bash
mongorestore --drop --uri mongodb://localhost:27017 /path/to/dump
```

### Sanitizing a shared backup

The final production backup contains personal data that must be removed before it is
distributed: the `accounts` collection stores plaintext emails, Google IDs, API keys and
ID tokens, and `amazon` contains affiliate URLs with embedded AWS access keys. Both are
safe to drop for a fresh instance — accounts are recreated on Google sign-in, and the
amazon affiliate widget is legacy.

```bash
# copies every collection EXCEPT accounts and amazon into ./clean-dump
node scripts/sanitize-backup.js /path/to/original/dump ./clean-dump

# optionally re-compress
cd clean-dump && 7z a smmdb_clean.7z .
```

Then restore `clean-dump` as above. The script is pure file-copy — it does not parse
BSON — so it is safe on backups of any size.

## 7. courses2 (Super Mario Maker 2) data

SMM2 courses (`courses2`, `course2Data`, `similarity`) are served by the app itself in
this repository. The separate `smmdb-api` service that the client historically proxied
to via `API_DOMAIN` is **not** required when running this repo directly — point
`apiDomain` at your own instance (see section 2).

## 8. Reverse proxy (public deployment)

Put a TLS-terminating reverse proxy in front, e.g. nginx:

```nginx
server {
  listen 443 ssl;
  server_name your.domain;

  # ssl_certificate / ssl_certificate_key ...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

The app sets `app.set('trust proxy', 1)` so `X-Forwarded-*` headers are honored.

## 9. Backup

The `backup` npm script (`node backup.js`) runs `mongodump` via a `mongo` docker
container and uploads the archive to MEGA using credentials from a gitignored
`.mongorc.json` (`{ username, password }`). Configure that file and run `yarn backup`.

## Troubleshooting

- **Login button missing / empty client id** — the client bundle was built without
  `GOOGLE_CLIENT_ID`. Rebuild with it set (section 3) or via build-arg (section 5).
- **`idToken not verified`** — server-side `GOOGLE_CLIENT_ID` env var is unset or
  doesn't match the client ID shown in the button.
- **White page on prod build** — the server reads `build/client/index.html` which is
  generated by HtmlWebpackPlugin during `build:client`; run the full `yarn build`.
- **Mongo connection errors** — set `MONGODB_URI`; the default assumes localhost.
