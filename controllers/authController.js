// Auth Controller de registro y login de usuarios

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//funcion registrar usuario bcryptjs para encriptar la contraseña y guardarla en la base de datos
const registrarUsuario = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Tipos: tienen que ser strings, no objetos ni arrays
        if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ mensaje: 'Datos inválidos' });
        }

        const usernameLimpio = username.trim();
        const emailLimpio = email.trim().toLowerCase();

        // 2. Formato y largo
        if (usernameLimpio.length < 3) {
            return res.status(400).json({ mensaje: 'El usuario debe tener al menos 3 caracteres' });
        }
        if (!emailValido(emailLimpio)) {
            return res.status(400).json({ mensaje: 'El email no es válido' });
        }
        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener entre 8 y 72 caracteres' });
        }

        // 3. Duplicados
        const usuarioExistente = await User.findOne({
            $or: [{ email: emailLimpio }, { username: usernameLimpio }]
        });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El usuario ya existe o el email ya está registrado' });
        }

        // 4. Hash y creación
        const passwordHasheada = await bcrypt.hash(password, 10);

        const nuevoUsuario = await User.create({
            username: usernameLimpio,
            email: emailLimpio,
            password: passwordHasheada,
        });

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: nuevoUsuario._id,
                username: nuevoUsuario.username,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role,
            },
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

const loginUsuario = async (req, res) => {
 
try{
   //sacar email y password del body 
 const { email, password } = req.body;

if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
}

const usuario = await User.findOne({ email: email.trim().toLowerCase() });

if (!usuario || !usuario.password) {
    return res.status(400).json({ mensaje: 'Credenciales inválidas' });
}

// 4. Comparar la contraseña ingresada con el hash guardado
const passwordCorrecta = await bcrypt.compare(password, usuario.password);

if(!passwordCorrecta){
   return res.status(400).json({mensaje: 'Credenciales invalidas'})
}

//5. Generar el token JWT
const token = jwt.sign(
   {id: usuario._id, role: usuario.role},
   process.env.JWT_SECRET,
   {expiresIn: '1h'}
);

//6. Responder con el toekn

res.status(200).json({
   mensaje: 'Login exitoso',
   token,
   usuario: {
      id: usuario._id,
      username: usuario.username,
      email: usuario.email,
      role: usuario.role
   },
});
}catch(error){
   console.error('Error al iniciar sesion:', error);
   res.status(500).json({mensaje:'Error del servidor'});
}
}


module.exports = {registrarUsuario, loginUsuario};