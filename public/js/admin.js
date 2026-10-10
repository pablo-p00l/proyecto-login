(async () => {
    const token = localStorage.getItem('token');

    // 1. Sin token, no hay nada que hacer acá
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // 2. Pedimos la lista mandando el token en el header
        const respuesta = await fetch('/api/usuarios/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        // 3. Distinguimos los dos casos de rechazo
        if (respuesta.status === 401) {
            // token inválido o vencido
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
            return;
        }

        if (respuesta.status === 403) {
            // token válido, pero no sos admin
            mostrarMensaje('No tenés permisos para ver esta página', 'error');
            return;
        }

        if (!respuesta.ok) {
            mostrarMensaje('No se pudieron cargar los usuarios', 'error');
            return;
        }

        const usuarios = await respuesta.json();
        dibujarTabla(usuarios);

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
})();

function dibujarTabla(usuarios) {
    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = '';

    usuarios.forEach((u) => {
        const fila = document.createElement('tr');

        const datos = [
            u.username,
            u.email,
            u.role,
            u.googleId ? 'Google' : 'Email',
        ];

        datos.forEach((texto) => {
            const celda = document.createElement('td');
            celda.textContent = texto;
            fila.appendChild(celda);
        });

        tbody.appendChild(fila);
    });
}

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `show ${tipo}`;
}