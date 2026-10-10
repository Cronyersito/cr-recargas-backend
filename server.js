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
  const playerId = req.query.id;

  if (!playerId) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }

  try {
    // Petición al endpoint público de verificación de Free Fire LATAM / SAC
    const apiUrl = `https://region-sac.ff.garena.com/api/client/checkout/get_player_id?app_id=100067&player_id=${playerId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });

    const data = await response.json();

    // Verificación de respuesta
    if (data && data.nickname) {
      return res.json({
        success: true,
        nickname: data.nickname
      });
    }

    if (data && data.data && data.data.nickname) {
      return res.json({
        success: true,
        nickname: data.data.nickname
      });
    }

    return res.json({
      success: false,
      message: 'ID no encontrado en la región LATAM'
    });

  } catch (error) {
    console.error('Error al verificar en Garena:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al conectar con la API de Free Fire'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
