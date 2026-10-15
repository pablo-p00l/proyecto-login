
/* Server.js created by Pablo-p00l */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Configuración del proxy de Render
app.set('trust proxy', 1);

// Conexión con MongoDB
connectDB();

// Headers de seguridad
app.use(helmet());

// Middleware para leer JSON
app.use(express.json());

// Servir archivos estáticos de public
app.use(express.static(path.join(__dirname, 'public')));

// Página principal: login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Inicializar Passport
const passport = require('./config/passport');
app.use(passport.initialize());

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/usuarios', require('./routes/userRoutes'));

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
