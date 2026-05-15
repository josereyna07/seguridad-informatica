// ============================================
// APLICACIÓN SEGURA - CORREGIDA
// ============================================

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const validator = require('validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ✅ Headers de seguridad
app.use(helmet());

// Configuración básica
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ✅ Sesión segura
app.use(session({
  secret: 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ✅ Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login.'
});

// Datos de usuarios
const usuarios = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com' },
  { id: 2, username: 'user1', password: 'password1', email: 'user@example.com' }
];

let usuarioLogueado = null;

// ✅ Funciones de validación
function esUsernameValido(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function esContraseñaValida(password) {
  return password && password.length >= 6 && password.length <= 100;
}

function esAdmin() {
  return usuarioLogueado && usuarioLogueado.username === 'admin';
}

// ============================================
// RUTAS SEGURAS
// ============================================

app.post('/login', loginLimiter, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // ✅ Validar entrada
  if (!esUsernameValido(username) || !esContraseñaValida(password)) {
    return res.status(400).send('<h1>Datos inválidos</h1>');
  }
  
  const usuario = usuarios.find(u => 
    u.username === username && u.password === password
  );
  
  if (usuario) {
    usuarioLogueado = usuario;
    res.send(`<h1>Login Exitoso</h1><p>Bienvenido ${usuario.username}</p>`);
  } else {
    res.send('<h1>Credenciales Inválidas</h1>');
  }
});

app.get('/profile', (req, res) => {
  const username = req.query.username;
  
  if (!username) {
    res.send('<h1>Por favor proporciona un username</h1>');
    return;
  }
  
  // ✅ Escapar entrada
  const safeUsername = validator.escape(username);
  
  res.send(`
    <html>
      <h1>Perfil de Usuario</h1>
      <p>Username: ${safeUsername}</p>
    </html>
  `);
});

app.get('/admin/users', (req, res) => {
  // ✅ Validar autenticación
  if (!usuarioLogueado) {
    return res.status(401).send('<h1>Error 401: No estás logueado</h1>');
  }
  
  // ✅ Validar autorización
  if (!esAdmin()) {
    return res.status(403).send('<h1>Error 403: Acceso denegado</h1>');
  }
  
  let listaHTML = '<h1>Lista de Usuarios</h1><ul>';
  usuarios.forEach(u => {
    listaHTML += `<li>${u.username} - ${u.email}</li>`;  // ✅ Sin contraseñas
  });
  listaHTML += '</ul>';
  
  res.send(listaHTML);
});

app.get('/api/data', (req, res) => {
  try {
    const datos = JSON.parse(req.query.data || '{}');
    res.json(datos);
  } catch (err) {
    // ✅ Sin exponer detalles técnicos
    console.error('Error:', err);
    
    res.status(400).json({
      success: false,
      message: 'Error en los datos proporcionados.'
    });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor seguro en http://localhost:${PORT}`);
});