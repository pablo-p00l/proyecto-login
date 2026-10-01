const jwt = require('jsonwebtoken');



const verificarToken = (req, res, next) =>
{
    //1. leer el header Authorization

    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({mensaje: "No se proporciono token de acceso"});
    }

    //2. el header viene como "bearer ayjhbGc..." - separamaos por espacio
    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer'){
        return res.status(401).json({mensaje: 'Formato de token invalido'});
    }

    const token = partes[1];
    //3. Verificar el token

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //4. Guardamos los datos del usuario en req, para el siguiente paso de la cadena
        req.usuario = decoded;

        //5. dejamos pasar la peticion
        next();


    }catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });


}} ;

const esAdmin = (req, res, next)=> {
    // asumimos que verificartoken ya corrio antes y dejo req.usuario cargando
    if(req.usuario.role !== 'admin'){
        return res.status(403).json({mensaje: 'Acceso denegado: se equiere rol de admin'});

    }
    next();

};
module.exports = {verificarToken, esAdmin};