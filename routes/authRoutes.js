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

        // En vez de responder JSON, redirigimos al dashboard con los datos en la URL
        const usuario = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        }));

        res.redirect(`/dashboard.html?token=${token}&usuario=${usuario}`);
    }
);

module.exports = router;