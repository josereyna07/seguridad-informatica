// ============================================
// APP VULNERABLE - PARTE 1: SQL INJECTION
// ============================================

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Configuración básica
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const session = require('express-session');

// ============================================
// CONFIGURACIÓN INSEGURA DE SESIÓN (VULNERABLE)
// ============================================
app.use(session({
  secret: 'secret-123',  // ❌ Secreto débil y en el código
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,    // ❌ Se transmite por HTTP
    httpOnly: false   // ❌ Accesible por JavaScript
  }
}));

// Simular una base de datos (sin usar DB real por ahora)
const usuarios = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com' },
  { id: 2, username: 'user1', password: 'password1', email: 'user@example.com' }
];

// ============================================
// RUTA 1: SQL INJECTION (VULNERABLE)
// ============================================
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // ❌ VULNERABLE: Búsqueda simple (simulando SQL vulnerable)
  // En una DB real, sería: "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
  
  // Búsqueda vulnerable a inyección
  const usuario = usuarios.find(u => 
    u.username === username && u.password === password
  );

  if (usuario) {
    res.send(`
      <html>
        <h1>Login Exitoso</h1>
        <p>¡Bienvenido ${username}!</p>
        <p>Email: ${usuario.email}</p>
      </html>
    `);
  } else {
    res.send('<h1>Credenciales Inválidas</h1>');
  }
});

// ============================================
// RUTA 2: XSS (VULNERABLE)
// ============================================
app.get('/profile', (req, res) => {
  const username = req.query.username;
  
  // ❌ VULNERABLE: Mostrar entrada del usuario sin escapar
  res.send(`
    <html>
      <h1>Perfil de Usuario</h1>
      <p>Username: ${username}</p>
      <p><a href="/login">Volver al login</a></p>
    </html>
  `);
});

// ============================================
// RUTA 3: SIN CONTROL DE ACCESO (VULNERABLE)
// ============================================
app.get('/admin/users', (req, res) => {
  // ❌ VULNERABLE: Sin verificar si el usuario es admin
  
  // Mostrar todos los usuarios
  let listaHTML = '<h1>Lista de Usuarios (Admin)</h1><ul>';
  
  usuarios.forEach(u => {
    listaHTML += `<li>${u.username} - ${u.email} - ${u.password}</li>`;
  });
  
  listaHTML += '</ul>';
  
  res.send(listaHTML);
});

// ============================================
// RUTA 4: EXPOSICIÓN DE ERRORES (VULNERABLE)
// ============================================
app.get('/api/data', (req, res) => {
  try {
    const datos = JSON.parse(req.query.data || '{}');
    res.json(datos);
  } catch (err) {
    // ❌ VULNERABLE: Exposer el error completo
    res.status(500).json({
      error: err.message,
      stack: err.stack  // ❌ Información sensible
    });
  }
});

// ============================================
// RUTA 5: LOGIN CON SESIÓN INSEGURA
// ============================================
app.post('/login-seguro', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const usuario = usuarios.find(u => 
    u.username === username && u.password === password
  );

  if (usuario) {
    // ❌ VULNERABLE: Guardando sesión sin protección
    req.session.userId = usuario.id;
    req.session.username = usuario.username;
    
    res.send(`
      <html>
        <h1>Login Exitoso</h1>
        <p>¡Bienvenido ${usuario.username}!</p>
        <p><a href="/dashboard">Ir al Dashboard</a></p>
      </html>
    `);
  } else {
    res.send('<h1>Credenciales Inválidas</h1>');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    res.send('<h1>No estás logueado</h1>');
    return;
  }
  
  res.send(`
    <html>
      <h1>Dashboard</h1>
      <p>Bienvenido ${req.session.username}</p>
      <p>Tu ID: ${req.session.userId}</p>
    </html>
  `);
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});