document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(data.mensaje || 'Credenciales inválidas', 'error');
            return;
        }

        // Guardamos el token para usarlo en futuras peticiones
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensaje('No se pudo conectar con el servidor', 'error');
    }
});

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `show ${tipo}`;
}