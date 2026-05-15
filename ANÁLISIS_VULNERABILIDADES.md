# ANÁLISIS DE VULNERABILIDADES - Mi Aplicación

## VULNERABILIDAD 1: XSS (Cross-Site Scripting)

### Ubicación:
- Archivo: `app.js`
- Ruta: `GET /profile`
- Línea: Aproximadamente línea 45

### Código vulnerable:
```javascript
const username = req.query.username;
res.send(`<p>Username: ${username}</p>`);
```

### ¿Qué es el problema?
- La entrada del usuario (`username`) se inserta directamente en HTML
- No se valida ni se escapan caracteres especiales
- Un atacante puede inyectar código JavaScript

### Ataque posible:

## VULNERABILIDAD 2: Control de Acceso Incorrecto

### Ubicación:
- Archivo: `app.js`
- Ruta: `GET /admin/users`

### Código vulnerable:
```javascript
app.get('/admin/users', (req, res) => {
  // Sin validación de permisos
  usuarios.forEach(u => {
    listaHTML += `<li>${u.username} - ${u.password}</li>`;
  });
});
```

### ¿Qué es el problema?
- No hay validación de que seas administrador
- Cualquiera puede acceder a esta ruta
- Se exponen TODAS las contraseñas

### Cómo probarlo:
1. Abre sin estar logueado: `http://localhost:3000/admin/users`
2. ¿Ves la lista de usuarios y contraseñas? → VULNERABLE

### Impacto:
- 🔴 CRÍTICO
- Exposición de credenciales de todos los usuarios
- Compromiso total de la seguridad

## VULNERABILIDAD 3: Exposición de Errores Internos

### Ubicación:
- Archivo: `app.js`
- Ruta: `GET /api/data`

### Código vulnerable:
```javascript
catch (err) {
  res.json({
    error: err.message,
    stack: err.stack  // ❌ Expone detalles técnicos
  });
}
```

### ¿Qué es el problema?
- El stack trace revela paths del servidor
- Muestra qué librerías se usan
- Un atacante aprende la arquitectura

### Cómo probarlo:
1. Abre: `http://localhost:3000/api/data?data=invalid`
2. ¿Ves el stack trace con rutas del sistema? → VULNERABLE

### Impacto:
- 🟠 ALTO
- Información para planificar ataques
- Revelación de estructura del sistema