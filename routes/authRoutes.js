// Ruta de autenticación
const express = require('express');
const router = express.Router();
const {registrarUsuario, loginUsuario} = require('../controllers/authController');

// Ruta de registro de usuario
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

module.exports = router;