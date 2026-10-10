const token = localStorage.getItem('token');
const miId = JSON.parse(localStorage.getItem('usuario') || '{}').id;

if (!token) {
    window.location.href = 'login.html';
}

async function cargarUsuarios() {
    try {
        const respuesta = await fetch('/api/usuarios/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (respuesta.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
            return;
        }

        if (respuesta.status === 403) {
            mostrarMensaje('No tenés permisos para ver esta página', 'error');
            return;
        }

        if (!respuesta.ok) {
            mostrarMensaje('No se pudieron cargar los usuarios', 'error');
            return;
        }

        dibujarTabla(await respuesta.json());

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
}

function dibujarTabla(usuarios) {
    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = '';

    usuarios.forEach((u) => {
        const fila = document.createElement('tr');

        [u.username, u.email].forEach((texto) => {
            const celda = document.createElement('td');
            celda.textContent = texto;
            fila.appendChild(celda);
        });

        // Columna de rol: selector (o texto fijo si sos vos)
        const celdaRol = document.createElement('td');
        if (u._id === miId) {
            celdaRol.textContent = `${u.role} (vos)`;
        } else {
            const select = document.createElement('select');
            select.className = 'form-select form-select-sm select-rol';
            ['user', 'admin'].forEach((rol) => {
                const opcion = document.createElement('option');
                opcion.value = rol;
                opcion.textContent = rol;
                opcion.selected = rol === u.role;
                select.appendChild(opcion);
            });
            select.addEventListener('change', () => cambiarRol(u._id, select.value));
            celdaRol.appendChild(select);
        }
        fila.appendChild(celdaRol);

        const celdaOrigen = document.createElement('td');
        celdaOrigen.textContent = u.googleId ? 'Google' : 'Email';
        fila.appendChild(celdaOrigen);

        // Columna de acciones
        const celdaAcciones = document.createElement('td');
        if (u._id !== miId) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-eliminar';
            btn.textContent = 'Eliminar';
            btn.addEventListener('click', () => eliminarUsuario(u._id, u.username));
            celdaAcciones.appendChild(btn);
        }
        fila.appendChild(celdaAcciones);

        tbody.appendChild(fila);
    });
}

async function cambiarRol(id, role) {
    try {
        const respuesta = await fetch(`/api/usuarios/admin/${id}/rol`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(data.mensaje || 'No se pudo cambiar el rol', 'error');
        } else {
            mostrarMensaje('Rol actualizado', 'exito');
        }
        cargarUsuarios();

    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
}

async function eliminarUsuario(id, username) {
    if (!confirm(`¿Eliminar a ${username}? Esta acción no se puede deshacer.`)) return;

    try {
        const respuesta = await fetch(`/api/usuarios/admin/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(data.mensaje || 'No se pudo eliminar', 'error');
        } else {
            mostrarMensaje('Usuario eliminado', 'exito');
        }
        cargarUsuarios();

    } catch (error) {
        console.error(error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
}

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `show ${tipo}`;
}

cargarUsuarios();