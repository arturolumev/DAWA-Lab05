// Importar las dependencias
const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

var mysql = require('mysql');


var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '12345678',
  database        : 'webavanzado_lab05'
});

var usuario;
var idusuario;

app.use(express.static(path.join(__dirname + "/public")));

io.on("connection", function(socket){
    socket.on("newUser", function(username, file) { //agregue file eliminar si no funciona
        socket.broadcast.emit("update", username + " se unio a la conversacion.");

        pool.query('INSERT IGNORE INTO usuarios SET ?', {nombre: username}, function (error, results, fields) {
            if (error) throw error;
            console.log('Respuesta INSERT: ', results);
            usuario = username;
        });
        
        pool.query('SELECT idusuarios FROM usuarios WHERE ?', {nombre: username}, function (error, results, fields) {
          if (error) throw error;
          console.log('Respuesta SELECT ID: ', results[0].idusuarios);
          idusuario = results[0].idusuarios;
      });

    });

    socket.on("exitUser", function(username) {
        socket.broadcast.emit("update", username + " se salio de la conversacion.");
    });

    socket.on("chat", function(message) {
        socket.broadcast.emit("chat", message);

        pool.query('INSERT INTO mensajes (mensaje, idusuarios) VALUES ("'+ message.text +'",' + idusuario +');', function (error, results, fields) {
          if (error) throw error;
          console.log('Respuesta: ', results);
      });

        console.log(usuario); 

    });
});

server.listen(8000);

