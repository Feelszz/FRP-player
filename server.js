import { createServer } from 'node:http';
import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);
const maxPlaylistMb = Math.min(Math.max(Number(process.env.MAX_PLAYLIST_MB || 50), 5), 200);
const maxPlaylistBytes = maxPlaylistMb * 1024 * 1024;
const playlistTimeoutMs = Math.min(Math.max(Number(process.env.PLAYLIST_TIMEOUT_MS || 180_000), 15_000), 300_000);
const asaasBaseUrl = process.env.ASAAS_BASE_URL || 'https://api-sandbox.asaas.com/v3';
const asaasApiKey = process.env.ASAAS_API_KEY || '';
const asaasWebhookToken = process.env.ASAAS_WEBHOOK_TOKEN || '';
const activationOrders = new Map();
const registeredDevices = new Map();
const stateFile = path.join(__dirname, 'data', 'activation-state.json');
const adminToken = process.env.FPR_ADMIN_TOKEN || '';
function loadActivationState() {
  try {
    const saved = JSON.parse(readFileSync(stateFile, 'utf8'));
    for (const [key, value] of Object.entries(saved.orders || {})) activationOrders.set(key, value);
    for (const [key, value] of Object.entries(saved.devices || {})) registeredDevices.set(key, value);
  } catch { /* primeiro início ou estado ainda inexistente */ }
}
function persistActivationState() {
  try {
    mkdirSync(path.dirname(stateFile), { recursive: true });
    writeFileSync(stateFile, JSON.stringify({ orders: Object.fromEntries(activationOrders), devices: Object.fromEntries(registeredDevices) }, null, 2), { mode: 0o600 });
  } catch { /* a operação principal não falha por armazenamento opcional */ }
}
loadActivationState();
const DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, asaas-access-token',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 128 * 1024) throw new Error('Payload muito grande.');
  }
  return body ? JSON.parse(body) : {};
}

async function asaasRequest(endpoint, options = {}) {
  if (!asaasApiKey) throw new Error('Asaas Sandbox ainda não está configurado no servidor.');
  const response = await fetch(`${asaasBaseUrl}${endpoint}`, {
    ...options,
    headers: { access_token: asaasApiKey, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.errors?.map((item) => item.description).join(' ') || `Asaas respondeu HTTP ${response.status}.`);
  return payload;
}

const fprLicenseSecret = process.env.FPR_LICENSE_SECRET || 'e7b0eb76295cb97dc9dcc6e02902adcbe9db74812b13b4a13e8ff01b6a6a750a';
function normalizeDeviceId(value) {
  return String(value || '').trim().toUpperCase();
}
function isValidDeviceId(value) {
  return /^FPR-[A-Z0-9]{8,32}$/.test(normalizeDeviceId(value));
}
function markOrderPaid(order) {
  if (!order || order.status === 'PAID') return;
  order.status = 'PAID';
  order.code ||= activationCode(order.deviceId);
  order.paidAt = Date.now();
  order.emailStatus = 'pending-email-provider';
  persistActivationState();
}
async function refreshActivationOrder(order) {
  if (!order || order.status === 'PAID' || !asaasApiKey) return;
  try {
    const payment = await asaasRequest(`/payments/${order.paymentId}`);
    if (['RECEIVED', 'CONFIRMED'].includes(String(payment.status || '').toUpperCase()) && Number(payment.value) === Number(order.amount)) markOrderPaid(order);
  } catch {
    // O webhook permanece como fonte principal; o próximo polling tentará novamente.
  }
}
function activationCode(deviceId) {
  const digest = createHmac('sha256', Buffer.from(fprLicenseSecret, 'hex')).update(`FPR1|${String(deviceId || '').trim().toUpperCase()}`).digest();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let bits = 0; let value = 0; let out = '';
  for (let i = 0; i < 10; i += 1) {
    value = (value << 8) | digest[i]; bits += 8;
    while (bits >= 5) { out += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; value &= (1 << bits) - 1; }
  }
  return out.match(/.{4}/g).join('-');
}

async function createAsaasPayment(body) {
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  let deviceId = normalizeDeviceId(body.deviceId);
  const cpfCnpj = String(body.cpfCnpj || '').replace(/\D/g, '');
  const dev = body.dev === true;
  if (!firstName || !lastName || !email || !deviceId || !cpfCnpj) throw new Error('Nome, sobrenome, CPF/CNPJ, e-mail e ID do dispositivo são obrigatórios.');
  if (![11, 14].includes(cpfCnpj.length)) throw new Error('Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Informe um e-mail válido.');
  if (!isValidDeviceId(deviceId)) throw new Error('ID do dispositivo inválido. Copie exatamente o ID exibido em Configurações no FPR Player.');
  const registered = registeredDevices.get(deviceId);
  if (!registered || Date.now() - registered.lastSeenAt > DEVICE_TTL_MS) throw new Error('Esse ID não foi localizado em um FPR Player ativo. Abra o aplicativo no dispositivo, entre em Configurações e copie o ID novamente.');
  registered.lastSeenAt = Date.now();
  const amount = dev ? 5.00 : 41.00;
  const orderId = randomUUID();
  const customer = await asaasRequest('/customers', { method: 'POST', body: JSON.stringify({ name: `${firstName} ${lastName}`, email, cpfCnpj }) });
  const payment = await asaasRequest('/payments', { method: 'POST', body: JSON.stringify({
    customer: customer.id, billingType: 'PIX', value: amount,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: `FPR Player ${dev ? 'DEV' : 'Oficial'} - ativação`, externalReference: `FPR:${orderId}`
  }) });
  const qr = await asaasRequest(`/payments/${payment.id}/pixQrCode`);
  activationOrders.set(orderId, { orderId, paymentId: payment.id, amount, email, deviceId, status: 'PENDING', code: null, createdAt: Date.now() });
  persistActivationState();
  persistActivationState();
  return { orderId, paymentId: payment.id, amount, status: 'PENDING', qrCode: qr.encodedImage ? `data:image/png;base64,${qr.encodedImage}` : null, payload: qr.payload || null };
}

function handleAsaasWebhook(request, response, body) {
  if (asaasWebhookToken && request.headers['asaas-access-token'] !== asaasWebhookToken) return sendJson(response, 401, { error: 'Webhook não autorizado.' });
  const payment = body.payment || {};
  const orderId = String(payment.externalReference || '').replace(/^FPR:/, '');
  const order = activationOrders.get(orderId) || [...activationOrders.values()].find((item) => item.paymentId === payment.id);
  if (order && body.event === 'PAYMENT_RECEIVED' && Number(payment.value) === Number(order.amount)) {
    markOrderPaid(order);
  }
  return sendJson(response, 200, { received: true });
}

function constantTimeTokenMatches(request) {
  if (!adminToken) return false;
  const supplied = String(request.headers['x-fpr-admin-token'] || '');
  const a = Buffer.from(supplied); const b = Buffer.from(adminToken);
  return a.length === b.length && createHmac('sha256', Buffer.from('fpr-admin-check')).update(a).digest('hex') === createHmac('sha256', Buffer.from('fpr-admin-check')).update(b).digest('hex');
}
function findActiveOrder(deviceId) {
  return [...activationOrders.values()].find((item) => item.deviceId === deviceId && item.status === 'PAID');
}
function verifyActivationCode(deviceId, code) {
  const normalized = String(code || '').trim().toUpperCase();
  const order = findActiveOrder(deviceId);
  return Boolean(order && normalized === String(order.code || '').toUpperCase());
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
  const requestedPath = pathname === '/' ? '/index.html' : pathname === '/iphone' ? '/iphone/index.html' : pathname.endsWith('/') ? `${pathname}index.html` : pathname;
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, asaas-access-token'
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { ok: true, service: 'fpr-player', asaasConfigured: Boolean(asaasApiKey) });
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

  if (request.method === 'POST' && requestUrl.pathname === '/api/activation/register-device') {
    try {
      const body = await readJson(request);
      const deviceId = normalizeDeviceId(body.deviceId);
      if (!isValidDeviceId(deviceId)) return sendJson(response, 400, { registered: false, error: 'ID do dispositivo inválido.' });
      registeredDevices.set(deviceId, { deviceId, firstSeenAt: registeredDevices.get(deviceId)?.firstSeenAt || Date.now(), lastSeenAt: Date.now() });
      persistActivationState();
      return sendJson(response, 200, { registered: true, deviceId });
    } catch (error) {
      return sendJson(response, 400, { registered: false, error: error?.message || 'Não foi possível registrar o dispositivo.' });
    }
  }
  if (request.method === 'POST' && requestUrl.pathname === '/api/asaas/create-payment') {
    try {
      const result = await createAsaasPayment(await readJson(request));
      sendJson(response, 201, result);
    } catch (error) {
      sendJson(response, 400, { error: error?.message || 'Não foi possível criar a cobrança Pix.' });
    }
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/activation/status') {
    const deviceId = normalizeDeviceId(requestUrl.searchParams.get('deviceId'));
    const order = [...activationOrders.values()].filter((item) => item.deviceId === deviceId).sort((a, b) => b.createdAt - a.createdAt)[0];
    await refreshActivationOrder(order);
    return sendJson(response, 200, order?.status === 'PAID' ? { active: true, code: order.code, paymentId: order.paymentId, source: order.paymentId ? 'asaas' : 'admin' } : { active: false });
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/activation/verify') {
    try {
      const body = await readJson(request);
      const deviceId = normalizeDeviceId(body.deviceId);
      if (!isValidDeviceId(deviceId) || !verifyActivationCode(deviceId, body.code)) return sendJson(response, 403, { valid: false, error: 'Ativação não encontrada para este dispositivo.' });
      return sendJson(response, 200, { valid: true });
    } catch (error) {
      return sendJson(response, 400, { valid: false, error: error?.message || 'Não foi possível validar a ativação.' });
    }
  }
  if (request.method === 'POST' && requestUrl.pathname === '/api/admin/activate') {
    if (!constantTimeTokenMatches(request)) return sendJson(response, 401, { error: 'Não autorizado.' });
    try {
      const body = await readJson(request);
      const deviceId = normalizeDeviceId(body.deviceId);
      if (!isValidDeviceId(deviceId)) return sendJson(response, 400, { error: 'ID do dispositivo inválido.' });
      const orderId = `ADMIN-${randomUUID()}`;
      const order = { orderId, paymentId: null, amount: 0, email: '', deviceId, status: 'PAID', code: activationCode(deviceId), createdAt: Date.now(), source: 'admin', note: String(body.note || '').slice(0, 200) };
      activationOrders.set(orderId, order);
      persistActivationState();
      return sendJson(response, 201, { activated: true, deviceId, code: order.code, orderId });
    } catch (error) {
      return sendJson(response, 400, { error: error?.message || 'Não foi possível ativar o dispositivo.' });
    }
  }
  if (request.method === 'GET' && requestUrl.pathname === '/api/asaas/payment-status') {
    const order = activationOrders.get(requestUrl.searchParams.get('orderId'));
    if (!order) return sendJson(response, 404, { error: 'Pedido não encontrado.' });
    return sendJson(response, 200, { status: order.status, code: order.status === 'PAID' ? order.code : null, emailStatus: order.emailStatus || null });
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/asaas/webhook') {
    try {
      handleAsaasWebhook(request, response, await readJson(request));
    } catch {
      sendJson(response, 400, { error: 'Webhook inválido.' });
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
