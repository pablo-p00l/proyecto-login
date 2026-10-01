// Ruta de autenticación
const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Ruta de registro de usuario
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

// Paso 1: redirige a Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Paso 2: Google redirige acá después de que el usuario acepta
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login-fallido' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            mensaje: 'Login con Google exitoso',
            token,
            usuario: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
            },
        });
    }
);

module.exports = router;