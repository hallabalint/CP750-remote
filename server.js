const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { Telnet } = require('telnet-client')
const connection = new Telnet()



const webPort = 8080;
const telnetPort = 61408;
const telnetIP = '192.168.1.55';
const params = {
    host: telnetIP,
    port: telnetPort,
    negotiationMandatory: false,
    timeout: 0
  }
  
  connection.on('ready', prompt => {
    connection.exec('cp750.ctrl.full_ascii_ctrl 1', (err, response) => {
      console.log(response)
    })
  })
  
  connection.on('timeout', () => {
    console.log('socket timeout!')
    connection.end()
  })
  
  connection.on('close', () => {
    console.log('connection closed')
  })
  
  connection.connect(params)
  connection.send('cp750.ctrl.full_ascii_ctrl 1\n', (err, response) => {
    console.log(response)
  })

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('volume', (data) => {
        console.log('volume: ' + data);
        connection.exec('when cp750.ctrl.volume ' + data, (err, response) => {
            console.log(response)
        })
    });
});

server.listen(webPort);