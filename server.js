const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Ruta base para confirmar que el servidor responde
app.get('/', (req, res) => {
  res.send('Servidor CR Recargas activo');
});

// Ruta de verificación
app.get('/api/verify-id', async (req, res) => {
  const playerId = req.query.id;

  if (!playerId) {
    return res.status(400).json({ success: false, message: 'ID requerido' });
  }

  try {
    const apiUrl = `https://region-sac.ff.garena.com/api/client/checkout/get_player_id?app_id=100067&player_id=${playerId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const data = await response.json();

    if (data && data.nickname) {
      return res.json({
        success: true,
        nickname: data.nickname
      });
    } else {
      return res.json({
        success: false,
        message: 'ID no encontrado'
      });
    }
  } catch (error) {
    console.error('Error al verificar:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de conexion con Garena'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
