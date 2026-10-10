const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint de verificación de ID
app.get('/api/check-id/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid || isNaN(uid)) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }

  try {
    const response = await fetch(`https://glob-info2.vercel.app/info?uid=${uid}`);
    
    if (!response.ok) {
      throw new Error('No se encontró el jugador');
    }

    const data = await response.json();

    if (data && data.basicInfo && data.basicInfo.nickname) {
      return res.json({
        success: true,
        nickname: data.basicInfo.nickname,
        accountLevel: data.basicInfo.level || null
      });
    } else {
      return res.status(404).json({ success: false, error: 'ID no encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Error al consultar la cuenta' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});