# Proyecto Login — Sistema de Autenticación con Roles
 
Sistema de login completo con registro tradicional, autenticación con JWT, autorización por roles (usuario/admin) y login social con Google OAuth 2.0.
 
Proyecto de aprendizaje construido paso a paso, enfocado en entender el por qué de cada decisión de arquitectura y seguridad.
 
## Stack
 
- **Node.js** + **Express** — servidor y enrutamiento
- **MongoDB** + **Mongoose** — base de datos y modelado de datos
- **bcrypt** — hasheo de contraseñas
- **jsonwebtoken (JWT)** — autenticación basada en tokens (stateless)
- **Passport.js** + **passport-google-oauth20** — login social con Google
- **dotenv** — manejo de variables de entorno
## Estructura del proyecto
 
```
/config
  db.js           → conexión a MongoDB
  passport.js     → configuración de la estrategia de Google OAuth
/models
  User.js         → schema de Usuario (Mongoose)
/controllers
  authController.js → lógica de registro y login
/middlewares
  authMiddleware.js → verificación de token y de rol
/routes
  authRoutes.js   → rutas de autenticación (/register, /login, /google)
  userRoutes.js   → rutas protegidas de ejemplo (/perfil, /esAdmin)
server.js         → punto de entrada de la app
.env              → variables de entorno (no se sube al repo)
```
 
## Seguridad implementada
 
- Las contraseñas nunca se guardan en texto plano — se hashean con `bcrypt` (10 salt rounds) antes de persistirlas.
- La autenticación es stateless: en vez de sesiones del lado del servidor, se usa un JWT firmado que el cliente reenvía en cada petición mediante el header `Authorization: Bearer <token>`.
- El JWT incluye `id` y `role` en el payload, pero nunca datos sensibles.
- Los tokens expiran a la hora (`expiresIn: '1h'`).
- Las rutas protegidas usan dos middlewares encadenados:
  - `verificarToken` — autenticación (¿quién sos?)
  - `esAdmin` — autorización (¿qué podés hacer según tu rol?)
- El modelo de Usuario usa `unique` a nivel de base de datos (no solo validación en el código) para evitar condiciones de carrera en registros simultáneos.
- El campo `googleId` es `sparse`, para no romper el índice único cuando el usuario se registró por email/contraseña en vez de Google.
- Credenciales (Mongo URI, JWT secret, credenciales de Google) viven únicamente en `.env`, excluido del control de versiones.
## Variables de entorno necesarias
 
Crear un archivo `.env` en la raíz con:
 
```dotenv
PORT=3000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/login-auth-db?retryWrites=true&w=majority
JWT_SECRET=una_cadena_larga_y_aleatoria
 
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```
 
## Instalación y uso
 
```bash
# Instalar dependencias
npm install
 
# Levantar el servidor (modo desarrollo, con reinicio automático)
npx nodemon server.js
 
# o en modo simple
node server.js
```
 
El servidor queda disponible en `http://localhost:3000`.
 
## Endpoints
 
### Autenticación — `/api/auth`
 
| Método | Ruta | Descripción | Body |
|---|---|---|---|
| POST | `/register` | Registra un usuario nuevo con email/contraseña | `{ username, email, password }` |
| POST | `/login` | Login tradicional, devuelve JWT | `{ email, password }` |
| GET | `/google` | Inicia el flujo de login con Google | — |
| GET | `/google/callback` | Callback de Google, devuelve JWT | — (lo maneja Google) |
 
### Usuarios — `/api/usuarios` (requieren header `Authorization: Bearer <token>`)
 
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/perfil` | Cualquier usuario autenticado | Devuelve el id y rol del usuario logueado |
| GET | `/esAdmin` | Solo rol `admin` | Ruta de ejemplo protegida por rol |
 
## Cómo funciona el login con Google
 
Google reemplaza únicamente el paso de "verificar credenciales" del flujo tradicional — el resultado final es el mismo JWT, generado de la misma forma:
 
```
Login tradicional:  email + password → bcrypt.compare → JWT
Login con Google:   Google confirma identidad → busca/crea usuario → JWT
```
 
Por eso los middlewares de autenticación y autorización no necesitan ningún cambio para soportar ambos métodos de login.
 
## Pendiente / próximos pasos
 
- Frontend en HTML y CSS que consuma esta API (fetch)
- Manejo de ruta de fallo de login (/login-fallido)
- Recuperación de contraseña
 