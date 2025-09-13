import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/*", cors());

app.get('/*', async (c) => {
  // c.req.path contiene la pathname richiesta, ad es. "/movie/popular"
  const incomingPath = c.req.path; // include lo slash iniziale

  const params = new URLSearchParams(c.req.query());
  const apiKey = Bun.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('TMDB_API_KEY mancante');
    return c.text('TMDB_API_KEY mancante', 500);
  }

  console.log('INCOMING REQUEST:', incomingPath);
  console.log('WITH PARAMS:', params.toString());

  const tmdbUrl = `https://api.themoviedb.org/3${incomingPath}?${params.toString()}`;

  try {
    const response = await fetch(tmdbUrl, { headers: { Authorization: 'Bearer ' + apiKey } }); // costruisci la query string nel URL
    const data = await response.json();
    return c.json(data, response.status);
  } catch (err) {
    console.error('Errore fetch verso TMDB:', err);
    return c.text('Errore upstream', 502);
  }
});

console.log('START SERVING ON PORT ' + Bun.env.PORT);
Bun.serve({
  port: Bun.env.PORT ?? 3000,
  fetch: app.fetch,
});