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
    // Consulta por POST a Pagostore LATAM
    const response = await fetch('https://shop.garena.sg/api/auth/player_id_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        app_id: 100067,
        login_id: playerId
      })
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
        message: 'ID no encontrado en Garena'
      });
    }
  } catch (error) {
    console.error('Error al conectar con Garena:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de conexion con Garena'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
