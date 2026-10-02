
// Si venimos de un login con Google, los datos llegan por la URL
const params = new URLSearchParams(window.location.search);
const tokenDeGoogle = params.get('token');
const usuarioDeGoogle = params.get('usuario');

if (tokenDeGoogle && usuarioDeGoogle) {
    localStorage.setItem('token', tokenDeGoogle);
    localStorage.setItem('usuario', decodeURIComponent(usuarioDeGoogle));

    // Limpiamos la URL para que no quede el token visible ahí
    window.history.replaceState({}, document.title, '/dashboard.html');
}

// Esta función se ejecuta apenas carga la página
(async () => {
    const token = localStorage.getItem('token');

    // 1. Si no hay token guardado, ni siquiera intentamos pedir el perfil
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // 2. Pedimos el perfil, mandando el token en el header Authorization
        const respuesta = await fetch('/api/usuarios/perfil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        // 3. Si el token es inválido o expiró, el backend responde 401
        if (!respuesta.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
            return;
        }

        // 4. Mostramos los datos. Usamos lo que ya teníamos guardado del login,
        //    ya que /perfil solo devuelve id y role (no username/email)
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));

        document.getElementById('bienvenida').textContent = `Hola, ${usuarioGuardado.username}`;
        document.getElementById('campoUsername').textContent = usuarioGuardado.username;
        document.getElementById('campoEmail').textContent = usuarioGuardado.email;
        document.getElementById('campoRole').textContent = usuarioGuardado.role;
        document.getElementById('datosUsuario').style.display = 'block';

    } catch (error) {
        console.error('Error de red:', error);
        window.location.href = 'login.html';
    }
})();

// 5. Botón de logout
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
});