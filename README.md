# Movie Mates

Shared watchlists for friends. Find movies and TV shows, add them to lists you share
with other people, and keep track of what you've watched and what's still to watch.

The app is built with Ionic and Angular, uses Firebase as its backend, and runs on
Android through Capacitor. Movie data comes from [TMDB](https://www.themoviedb.org/).

## Features

- **Browse**: trending titles, latest releases, popular and top rated, plus a discover
  page with sorting options.
- **Title details**: cast, director, trailer, recommendations, and *where to watch*
  (streaming, rent or buy).
- **Shared lists**: create a list and invite friends by username or with a short list
  code. Each movie is marked *watched* or *to watch*. Owners manage the members.
- **Social**: friends and a community page.
- **Accounts**: email/password sign-up with email verification and password reset.
- Italian and English UI.

## Stack

| | |
|---|---|
| App | Angular 19, Ionic 8, Angular Material / Bootstrap, ngx-translate |
| Mobile | Capacitor 7 (Android) |
| Data and auth | Firebase Authentication, Firebase Realtime Database |
| API proxy | Bun + Hono, deployed on Railway |

## Architecture notes

- **The TMDB key stays off the client.** The app never calls TMDB directly. Every request
  goes through a small proxy (`be/tmdb`), which adds the TMDB credentials on the server.
- **The proxy is protected.** It checks each request's Firebase ID token with the Admin
  SDK, so only signed-in users can reach it, and it rate-limits requests per IP.
- **The database is denormalized.** Lists live under `lists/{id}` with their info and
  members, and each user has an index at `users/{uid}/lists`. Loading "my lists" takes a
  single read, and multi-path updates keep both sides consistent.

## Running locally

### App

```bash
npm install
npm start          # ng serve
```

The Firebase web config and the proxy URL are set in `src/environments/`.

To build for Android:

```bash
ng build
npx cap sync android
npx cap open android
```

### TMDB proxy

```bash
cd be/tmdb
bun install
bun run index.ts
```

Environment variables:

| Variable | |
|---|---|
| `TMDB_API_KEY` | TMDB read access token |
| `FIREBASE_CREDENTIALS` | Firebase service account JSON, as a single-line string |
| `MAX_REQUESTS_PER_MINUTE` | optional, defaults to 60 |

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
