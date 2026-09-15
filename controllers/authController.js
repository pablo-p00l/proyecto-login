// Auth Controller de registro y login de usuarios

const User = require('../models/User');
const bcrypt = require('bcrypt');


//funcion registrar usuario bcryptjs para encriptar la contraseña y guardarla en la base de datos
const registerUser = async (req, res) => {
    try {
         const { username, email, password } = req.body;
       
         
         // 1. validacion  basica de los campos
         if(!username || !email || !password){
            return res.status(400).json({mensaje: "Todos los campos son obligatorios"})
         }
         //2 verificar si el usuario ya existe (por email o username)
          const usuarioExistente = await User.findOne ({ $or: [{email}, {username}] });
         if (usuarioExistente){
            return res.status(400).json({mensaje: 'El usuario ya existe o el email ya esta registrado'});
         }
         //3 encriptar la contraseña
         const saltRounds = 10;
         const passwordHasheada = await bcrypt.hash(password, saltRounds);

         //4 Crear el Usuario con el hash, no la contraseña original

         const nuevoUsuario =  await User.create({
            username,
            email,
            password: passwordHasheada,
         });
         //5 responder con el usuario creado (sin la contraseña)

         res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: nuevoUsuario._id,
                username: nuevoUsuario.username,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role,
            },
         });

    } catch (error){
        console.log('Error al registrar usuario', error.message);
        res.status(500).json({mensaje: 'Error del servidor'});

    }
};

module.exports = {registrarUsuario};