document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault(); // evita que el navegador recargue la página, comportamiento por defecto del form

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const mensajeDiv = document.getElementById('mensaje');

    try {
        const respuesta = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            // el backend respondió con un error (400, 500, etc.)
            mostrarMensaje(data.mensaje || 'Ocurrió un error', 'error');
            return;
        }

        mostrarMensaje('Cuenta creada correctamente. Redirigiendo al login...', 'exito');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

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