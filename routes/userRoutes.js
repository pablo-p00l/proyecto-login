const express = require('express');
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

module.exports = router;