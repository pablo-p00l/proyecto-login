const express = require('express');
const mongoose = require('mongoose');
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
// Cambiar el rol de un usuario
router.put('/admin/:id/rol', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ mensaje: 'Rol inválido' });
        }

        if (id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No podés cambiar tu propio rol' });
        }

        const usuario = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Rol actualizado', usuario });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar el rol' });
    }
});

// Eliminar un usuario
router.delete('/admin/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ mensaje: 'ID inválido' });
        }

        if (id === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No podés eliminarte a vos mismo' });
        }

        const usuario = await User.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario eliminado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
});
module.exports = router;