const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor CR Recargas activo');
});

// Ruta de verificación de ID
app.get('/api/verify-id', async (req, res) => {
  const playerId = req.query.id;

  if (!playerId) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }

  try {
    // API de verificación pública Pagostore / Garena Free Fire
    const response = await fetch(`https://mshop.garena.sg/api/auth/player_id_login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9',
        'Referer': 'https://mshop.garena.sg/'
      },
      body: JSON.stringify({
        app_id: 100067,
        login_id: playerId,
        app_server_id: 0
      })
    });

    const data = await response.json();

    // Validar si retorna el apodo del jugador
    if (data && (data.nickname || data.player_name)) {
      return res.json({
        success: true,
        nickname: data.nickname || data.player_name
      });
    }

    // Alternativa si el objeto viene envuelto en un campo de usuario
    if (data && data.user_info && data.user_info.nickname) {
      return res.json({
        success: true,
        nickname: data.user_info.nickname
      });
    }

    return res.json({
      success: false,
      message: 'ID no encontrado. Revisa los números ingresados.'
    });

  } catch (error) {
    console.error('Error al conectar con Garena:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de conexión con el servicio de Garena'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
