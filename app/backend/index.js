import app from './app.js'; // o './server.js' según tu estructura

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});