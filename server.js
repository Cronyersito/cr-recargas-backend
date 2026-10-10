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
    const response = await fetch(`https://api.yevapi.com/ff/info?id=${playerId}&region=sac`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const data = await response.json();

    if (data && (data.nickname || data.name || data.PlayerName)) {
      return res.json({
        success: true,
        nickname: data.nickname || data.name || data.PlayerName
      });
    }

    if (data && data.data && (data.data.nickname || data.data.username)) {
      return res.json({
        success: true,
        nickname: data.data.nickname || data.data.username
      });
    }

    return res.json({
      success: false,
      message: 'ID no encontrado. Verifica los números.'
    });

  } catch (error) {
    console.error('Error al verificar ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error de conexión con el servidor de verificación'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
