const express = require('express');
const User = require('../models/User');
const router = express.Router();
const {verificarToken, esAdmin} = require('../middlewares/authMiddleware');

//una ruta para get/ perfil que use solo verficartoken
router.get('/perfil', verificarToken, (req, res) => {
   res.json({ mensaje: `Hola, tu ID es ${req.usuario.id} y tu rol es ${req.usuario.role}` });
}

);

// una ruta admin que use verificarToken y esAdmin

router.get('/admin', verificarToken, esAdmin, (req, res) => {
    res.json({ mensaje: 'Hola Admin, tienes acceso a esta ruta' });
});
//ruta para get/admin que use verificarToken y esAdmin

router.get('/admin/usuarios', verificarToken, esAdmin, async (req, res) => {
    try {
        const usuarios = await User.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
});
module.exports = router;