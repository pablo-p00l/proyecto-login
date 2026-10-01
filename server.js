// Server.js created by Pablo-p00l
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// conectamos la base de datos
connectDB();

//Rutas de public carpeta
app.use(express.static('public'));

// middleware para poder leer los datos que nos envian desde el front JSON  del body de las peticiones
app.use(express.json());

// Importamos y configuramos passport
const passport = require('./config/passport');
app.use(passport.initialize());

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de usuario
app.use('/api/usuarios', require('./routes/userRoutes'));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

