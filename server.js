const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor CR Recargas activo');
});

app.get('/api/verify-id', async (req, res) => {
  const playerId = String(req.query.id || '').trim();

  if (!playerId) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }
  if (!/^\d{6,12}$/.test(playerId)) {
    return res.status(400).json({ success: false, message: 'ID inválido' });
  }

  const apiUrl = `https://region-sac.ff.garena.com/api/client/checkout/get_player_id?app_id=100067&player_id=${playerId}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });

    // Leemos como texto primero para poder ver qué responde Garena
    const body = await response.text();
    console.log('[verify-id]', playerId, 'status:', response.status, 'body:', body.slice(0, 500));

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: `Garena respondió con status ${response.status}`
      });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return res.status(502).json({
        success: false,
        message: 'Garena no devolvió JSON (posible bloqueo)'
      });
    }

    const nickname = data?.nickname || data?.data?.nickname || data?.name;

    if (nickname) {
      return res.json({ success: true, nickname });
    }

    return res.status(404).json({
      success: false,
      message: 'ID no encontrado en la región LATAM'
    });

  } catch (error) {
    console.error('[verify-id] fallo:', error.name, error.message, error.cause?.code || error.cause);
    return res.status(502).json({
      success: false,
      message: 'Error al conectar con la API de Free Fire'
    });
  } finally {
    clearTimeout(timer);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
