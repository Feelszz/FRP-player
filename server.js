import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);
const maxPlaylistMb = Math.min(Math.max(Number(process.env.MAX_PLAYLIST_MB || 50), 5), 200);
const maxPlaylistBytes = maxPlaylistMb * 1024 * 1024;
const playlistTimeoutMs = Math.min(Math.max(Number(process.env.PLAYLIST_TIMEOUT_MS || 180_000), 15_000), 300_000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.apk': 'application/vnd.android.package-archive'
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

function isAllowedPlaylistUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchPlaylist(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), playlistTimeoutMs);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate',
        'User-Agent': 'FPR-Player/1.0'
      }
    });

    if (!upstream.ok) {
      throw new Error(`A playlist respondeu com HTTP ${upstream.status}.`);
    }

    const length = Number(upstream.headers.get('content-length') || 0);
    if (length > maxPlaylistBytes) {
      throw new Error(`A playlist é maior que o limite de ${maxPlaylistMb} MB.`);
    }

    const text = await upstream.text();
    if (Buffer.byteLength(text, 'utf8') > maxPlaylistBytes) {
      throw new Error(`A playlist é maior que o limite de ${maxPlaylistMb} MB.`);
    }

    return { text, finalUrl: upstream.url || url };
  } finally {
    clearTimeout(timeout);
  }
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(publicDir, `.${requestedPath}`);
  const publicRoot = path.resolve(publicDir);

  if (!filePath.startsWith(`${publicRoot}${path.sep}`) || !existsSync(filePath)) {
    sendJson(response, 404, { error: 'Recurso não encontrado.' });
    return;
  }

  try {
    const contents = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
      ...(extension === '.apk' ? { 'Content-Disposition': 'attachment; filename="fpr-player.apk"' } : {}),
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(contents);
  } catch {
    sendJson(response, 500, { error: 'Não foi possível ler o recurso.' });
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'OPTIONS' && requestUrl.pathname.startsWith('/api/')) {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { ok: true, service: 'videoflow-player' });
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/playlist') {
    const sourceUrl = requestUrl.searchParams.get('url')?.trim();
    if (!sourceUrl || !isAllowedPlaylistUrl(sourceUrl)) {
      sendJson(response, 400, { error: 'Informe um link HTTP ou HTTPS válido para a playlist.' });
      return;
    }

    try {
      const playlist = await fetchPlaylist(sourceUrl);
      sendJson(response, 200, playlist);
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? 'O carregamento demorou demais. Verifique o link e tente novamente.'
        : error?.message || 'Não foi possível carregar a playlist.';
      sendJson(response, 502, { error: message });
    }
    return;
  }

  if (request.method === 'GET') {
    await serveStatic(request, response, requestUrl.pathname);
    return;
  }

  sendJson(response, 405, { error: 'Método não permitido.' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`VideoFlow Player ouvindo em http://0.0.0.0:${port}`);
});
