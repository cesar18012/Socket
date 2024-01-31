
const socket = io();

function ingresarChat() {
    const nombreUsuarioInput = document.getElementById('nombreUsuario');
    const nombreUsuario = nombreUsuarioInput.value;
    socket.emit('nombreUsuario', nombreUsuario);
    nombreUsuarioInput.disabled = true;
}

function enviarMensaje() {
    const mensajeInput = document.getElementById('mensajeInput');
    const mensaje = mensajeInput.value;
    socket.emit('mensajeCliente', mensaje);
    mensajeInput.value = '';
}

socket.on('mensajeServidor', (mensaje) => {
    const mensajesLista = document.getElementById('mensajesLista');
    const nuevoMensaje = document.createElement('li');
    nuevoMensaje.textContent = mensaje;
    mensajesLista.appendChild(nuevoMensaje);
});

socket.on('mensajePrivado', (mensaje) => {
    const mensajesPrivadosLista = document.getElementById('mensajesPrivadosLista');
    const nuevoMensajePrivado = document.createElement('li');
    nuevoMensajePrivado.textContent = `${mensaje.remitente} (Privado): ${mensaje.mensaje}`;
    mensajesPrivadosLista.appendChild(nuevoMensajePrivado);
});

socket.on('usuariosConectados', (usuarios) => {
    const usuariosConectadosLista = document.getElementById('usuariosConectadosLista');
    usuariosConectadosLista.innerHTML = '';

    usuarios.forEach((usuario) => {
        const nuevoUsuario = document.createElement('li');
        nuevoUsuario.textContent = usuario;
        usuariosConectadosLista.appendChild(nuevoUsuario);
    });
});
