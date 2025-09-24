import { initializeApp } from 'firebase-admin/app';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const admin = require('firebase-admin');
const app = new Hono();

// In-memory store per il rate limiting
const requests = new Map<string, { count: number; ts: number }>();

// Config
const JWT_SECRET = Bun.env.JWT_SECRET || 'super-secret';

const credentials = Bun.env.FIREBASE_CREDENTIALS;

if (!credentials) {
  throw new Error('Credenziali Firebase non trovate.');
}

const jsonCredentials = JSON.parse(credentials);

admin.initializeApp({
  credential: admin.credential.cert(jsonCredentials),
});

// Middleware: rate limiting per IP
app.use('/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  const limit = +(Bun.env.MAX_REQUESTS_PER_MINUTE ?? 60); // max richieste
  const windowMs = 60 * 1000; // 1 minuto

  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now - entry.ts > windowMs) {
    requests.set(ip, { count: 1, ts: now });
  } else {
    if (entry.count >= limit) {
      return c.text('Too many requests', 429);
    }
    entry.count++;
  }

  await next();
});
app.use('/*', cors({ origin: '*', allowHeaders: ['*'], allowMethods: ['*'] }));

// app.use(
//   '/*',
//   cors({
//     origin: (origin) => {
//       // Permetti il tuo dominio in dev e prod
//       if (!origin) return '*'; // per richieste server-to-server
//       if (origin === Bun.env.DEV_HOST || origin.endsWith(Bun.env.PROD_HOST!)) {
//         return origin;
//       }
//       return ''; // blocca altri origin
//     },
//     allowHeaders: ['Authorization', 'Content-Type'],
//     allowMethods: ['GET', 'POST', 'OPTIONS'],
//     exposeHeaders: ['Content-Length'],
//     maxAge: 600, // cache preflight
//     credentials: true,
//   })
// );

app.use('/*', async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('Formato token JWT non valido.');
    return c.text('Unauthorized', 401);
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken!);
    await next();
  } catch (err: any) {
    console.error(err.message || 'Token JWT non valido.');
    return c.text('Invalid token', 401);
  }

});

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
    const response = await fetch(tmdbUrl, {
      headers: { Authorization: 'Bearer ' + apiKey },
    }); // costruisci la query string nel URL
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
