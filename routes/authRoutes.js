// Ruta de autenticación
const express = require('express');
const router = express.Router();
const {registrarUsuario} = require('../controllers/authController');

// Ruta de registro de usuario
router.post('/register', registrarUsuario);

module.exports = router;