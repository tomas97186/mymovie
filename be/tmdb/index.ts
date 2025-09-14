import { Hono } from 'hono';
import { cors } from 'hono/cors';
import jwt from 'jsonwebtoken';

const app = new Hono();

// In-memory store per il rate limiting
const requests = new Map<string, { count: number; ts: number }>();

// Config
const JWT_SECRET = Bun.env.JWT_SECRET || 'super-secret';

app.use(
  '/*',
  cors({
    origin: (origin) => {
      // Permetti il tuo dominio in dev e prod
      if (!origin) return '*'; // per richieste server-to-server
      if (
        origin === Bun.env.DEV_HOST ||
        origin.endsWith(Bun.env.PROD_HOST!)
      ) {
        return origin;
      }
      return ''; // blocca altri origin
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600, // cache preflight
    credentials: true,
  })
);

// Endpoint per ottenere un JWT (es: login fake)
app.post('/auth', async (c) => {
  const body = await c.req.json();
  const { apiKey } = body;

  // Semplice check con la tua PROXY_SECRET
  if (apiKey !== Bun.env.PROXY_SECRET) {
    return c.text('Unauthorized', 401);
  }

  // Creazione token JWT valido 15 minuti
  const token = jwt.sign(
    { role: 'client' }, // payload
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  return c.json({ token });
});

// Middleware: JWT check
app.use('/*', async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.text('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return c.text('Invalid or expired token', 401);
  }

  await next();
});

// Middleware: rate limiting per IP
app.use('/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  const limit = 60; // max richieste
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
