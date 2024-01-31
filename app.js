const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// Arreglo para almacenar los nombres de usuario conectados y sus correspondientes sockets
const usuariosConectados = {};

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/cliente/index.html`);
});

io.on('connection', (socket) => {
    console.log('¡Un usuario se ha conectado!');

    // Función para enviar la lista actualizada de usuarios a todos los clientes
    function actualizarUsuarios() {
        io.emit('usuariosConectados', Object.keys(usuariosConectados));
    }

    // Manejar eventos de mensajes del cliente al servidor
    socket.on('mensajeCliente', (mensaje) => {
        const remitente = socket.username || 'Anónimo';
        const mensajeCompleto = `${remitente}: ${mensaje}`;

        // Si el mensaje es un mensaje privado
        if (mensaje.startsWith('@')) {
            const destinatario = mensaje.split(' ')[0].substring(1);
            const mensajePrivado = mensaje.split(' ').slice(1).join(' ');

            // Verificar que el destinatario esté en la lista de usuarios conectados
            if (usuariosConectados[destinatario]) {
                io.to(usuariosConectados[destinatario]).emit('mensajePrivado', {
                    remitente,
                    mensaje: mensajePrivado
                });
            } else {
                socket.emit('mensajeServidor', `El usuario ${destinatario} no está conectado.`);
            }
        } else {
            // Retransmitir el mensaje a todos los clientes
            io.emit('mensajeServidor', mensajeCompleto);
        }
    });

    // Manejar eventos de nombre de usuario
    socket.on('nombreUsuario', (nombre) => {
        socket.username = nombre;
        usuariosConectados[nombre] = socket.id; // Asociar el nombre de usuario con el ID del socket
        io.emit('mensajeServidor', `${nombre} se ha unido al chat.`);
        actualizarUsuarios(); // Enviar la lista actualizada a todos los clientes
    });

    // Manejar la desconexión del cliente
    socket.on('disconnect', () => {
        const usuarioDesconectado = socket.username || 'Usuario';
        io.emit('mensajeServidor', `${usuarioDesconectado} se ha desconectado.`);

        if (socket.username) {
            delete usuariosConectados[socket.username]; // Eliminar el usuario desconectado de la lista
            actualizarUsuarios(); // Enviar la lista actualizada a todos los clientes
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor Socket.io corriendo en http://localhost:3000`);
});
