# Proyecto Login — Sistema de Autenticación con Roles

Sistema de login completo con registro tradicional, autenticación con JWT, autorización por roles (usuario/admin), login social con Google OAuth 2.0 y un panel de administración para gestionar usuarios.

Proyecto de aprendizaje construido paso a paso, enfocado en entender el por qué de cada decisión de arquitectura y seguridad.

## Stack

- **Node.js** + **Express** — servidor y enrutamiento
- **MongoDB** + **Mongoose** — base de datos y modelado de datos
- **bcrypt** — hasheo de contraseñas
- **jsonwebtoken (JWT)** — autenticación basada en tokens (stateless)
- **Passport.js** + **passport-google-oauth20** — login social con Google
- **helmet** — headers HTTP de seguridad
- **express-rate-limit** — límite de intentos en login y registro
- **dotenv** — manejo de variables de entorno
- **Bootstrap 5** (por CDN) + CSS propio — frontend

## Estructura del proyecto

```
/config
  db.js             → conexión a MongoDB
  passport.js       → estrategia de Google OAuth
/models
  User.js           → schema de Usuario (Mongoose)
/controllers
  authController.js → lógica de registro y login
/middlewares
  authMiddleware.js → verificación de token y de rol
/routes
  authRoutes.js     → /register, /login, /google, /google/callback
  userRoutes.js     → perfil y rutas de administración
/public
  login.html, register.html, dashboard.html, admin.html
  /css/style.css
  /js/login.js, register.js, dashboard.js, admin.js
server.js           → punto de entrada de la app
.env                → variables de entorno (no se sube al repo)
```

## Seguridad implementada

**Contraseñas y tokens**
- Las contraseñas nunca se guardan en texto plano: se hashean con `bcrypt` (10 salt rounds).
- Autenticación stateless con JWT firmado, enviado en el header `Authorization: Bearer <token>`.
- El payload del JWT lleva solo `id` y `role`. Los tokens expiran a la hora.

**Autorización**
- Dos middlewares encadenados: `verificarToken` (¿quién sos?) y `esAdmin` (¿qué podés hacer?).
- Las rutas de administración los usan siempre en ese orden.
- Un admin no puede cambiarse el rol ni eliminarse a sí mismo, para que el sistema nunca quede sin administradores. La validación está en el backend, no solo en la interfaz.

**Validación de datos**
- El backend valida tipo, formato y largo de los datos recibidos: usuario de al menos 3 caracteres, email con formato válido y contraseña de 8 a 72 caracteres.
- Se verifica que los datos sean strings, para evitar inyección de operadores NoSQL.
- El email se normaliza (sin espacios, en minúsculas).
- Los IDs de la URL se validan antes de consultar la base.

**Protección de la aplicación**
- `helmet` agrega headers de seguridad, incluyendo una política de contenido (CSP).
- `express-rate-limit` limita a 10 intentos cada 15 minutos por IP en `/register` y `/login`, para frenar la fuerza bruta.
- En el frontend, los datos de usuarios se dibujan con `textContent` y no con `innerHTML`, para evitar XSS.

**Base de datos**
- `unique` a nivel de base de datos (no solo en el código) para evitar condiciones de carrera en registros simultáneos.
- `googleId` es `sparse`, para no romper el índice único cuando el usuario se registró con email y contraseña.
- Las respuestas nunca incluyen el campo `password`.

**Mensajes de error**
- El login responde siempre "Credenciales inválidas", sin distinguir si falló el email o la contraseña, para no revelar qué emails están registrados.

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

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Instalación y uso

```bash
npm install
npx nodemon server.js   # desarrollo, con reinicio automático
# o
node server.js
```

El servidor queda en `http://localhost:3000`. Las páginas se sirven desde el mismo servidor de Express, así que hay que abrirlas por ahí (por ejemplo `http://localhost:3000/login.html`) y no con extensiones tipo Live Server, porque las rutas `/api/...` son relativas.

## Páginas del frontend

| Página | Descripción |
|---|---|
| `/login.html` | Login con email y contraseña, o con Google |
| `/register.html` | Registro de usuario nuevo |
| `/dashboard.html` | Panel del usuario; verifica el token contra el backend |
| `/admin.html` | Gestión de usuarios (solo rol `admin`) |

## Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| POST | `/register` | Registra un usuario con email y contraseña | `{ username, email, password }` |
| POST | `/login` | Login tradicional, devuelve JWT | `{ email, password }` |
| GET | `/google` | Inicia el flujo de login con Google | — |
| GET | `/google/callback` | Callback de Google; redirige al dashboard con el token | — |

### Usuarios — `/api/usuarios` (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/perfil` | Usuario autenticado | Devuelve id y rol del token |
| GET | `/admin/usuarios` | Solo `admin` | Lista todos los usuarios (sin contraseñas) |
| PUT | `/admin/:id/rol` | Solo `admin` | Cambia el rol de un usuario. Body: `{ "role": "user" \| "admin" }` |
| DELETE | `/admin/:id` | Solo `admin` | Elimina un usuario |

## Cómo funciona el login con Google

Google reemplaza únicamente el paso de verificar credenciales; el resultado final es el mismo JWT:

```
Login tradicional:  email + password → bcrypt.compare → JWT
Login con Google:   Google confirma identidad → busca o crea usuario → JWT
```

Como el flujo de Google es una redirección completa del navegador (no un `fetch`), el callback redirige a `/dashboard.html` con el token en la URL; `dashboard.js` lo guarda en `localStorage` y limpia la URL. Si el login con Google falla o se cancela, vuelve a `/login.html?error=google` y se muestra un aviso.

Los usuarios creados con Google no tienen contraseña: tienen que entrar siempre con el botón de Google.

## Crear el primer administrador

Por seguridad no existe ningún endpoint para autopromoverse. El primer admin se crea a mano:

1. En MongoDB Atlas, abrir la colección `users`.
2. Editar el documento del usuario y cambiar `role` de `"user"` a `"admin"`.
3. Volver a iniciar sesión: el rol viaja dentro del JWT, así que el token anterior no se actualiza solo.

Los admins siguientes se promueven desde `/admin.html`.

## Limitaciones conocidas y próximos pasos

- El token se guarda en `localStorage`, que es vulnerable si hubiera un XSS. En producción conviene una cookie `httpOnly`.
- Si alguien se registra con email y contraseña y luego entra con Google usando el mismo email, el registro de Google falla por email duplicado. Falta definir cómo vincular ambas cuentas.
- Falta recuperación de contraseña.
- Falta configurar `trust proxy` para el rate limiting al desplegar detrás de un proxy (Render).