import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware (si necesitas, por ejemplo para JSON)
app.use(express.json());

// Rutas básicas
app.get('/', (req, res) => {
  res.send('Hola backend funcionando!');
});

// Aquí puedes agregar más rutas según necesites
// app.use('/api/usuarios', usuariosRouter);

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
