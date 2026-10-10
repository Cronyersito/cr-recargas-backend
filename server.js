const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor CR Recargas activo');
});

const BASE_URL = 'https://proapis.hlgamingofficial.com/main/games/freefire/validation/api';
const REGIONS = (process.env.FF_REGIONS || 'br').split(',').map(r => r.trim()).filter(Boolean);

// Caché de 10 minutos para ahorrar el límite diario (25 consultas)
const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

async function checkRegion(uid, region) {
  const params = new URLSearchParams({
    sectionName: 'freefireValidation',
    useruid: process.env.HL_USERUID,
    api: process.env.HL_API_KEY,
    uid,
    region,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}?${params}`, { signal: controller.signal });
    const body = await response.text();
    // No se imprime la URL para no filtrar la API key en los logs
    console.log('[verify-id]', uid, region, 'status:', response.status, 'body:', body.slice(0, 300));

    if (!response.ok) return { error: true };

    let data;
    try { data = JSON.parse(body); } catch { return { error: true }; }

    const result = data?.result;
    if (result?.valid === true && result.AccountName) {
      return { valid: true, nickname: result.AccountName, region };
    }
    if (result?.valid === false) return { valid: false };
    return { error: true };
  } catch (e) {
    console.error('[verify-id] fallo:', region, e.name, e.message, e.cause?.code || e.cause);
    return { error: true };
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/verify-id', async (req, res) => {
  const uid = String(req.query.id || '').trim();

  if (!uid) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }
  if (!/^\d{6,15}$/.test(uid)) {
    return res.status(400).json({ success: false, message: 'ID inválido' });
  }
  if (!process.env.HL_USERUID || !process.env.HL_API_KEY) {
    return res.status(500).json({ success: false, message: 'Faltan credenciales en el servidor' });
  }

  const cached = cache.get(uid);
  if (cached && Date.now() - cached.time < CACHE_MS) {
    return res.json({ success: true, nickname: cached.nickname });
  }

  let hadError = false;

  for (const region of REGIONS) {
    const r = await checkRegion(uid, region);
    if (r.valid) {
      cache.set(uid, { nickname: r.nickname, time: Date.now() });
      return res.json({ success: true, nickname: r.nickname, region: r.region });
    }
    if (r.error) hadError = true;
  }

  if (hadError) {
    return res.status(502).json({ success: false, message: 'No se pudo verificar el ID' });
  }
  return res.status(404).json({ success: false, message: 'ID no encontrado' });
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
