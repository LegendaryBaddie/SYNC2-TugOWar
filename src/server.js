const http = require('http');

const fs = require('fs');

const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handler = (req, res) => {
  // check if asking for bundle and send that back
  // otherwise send back html
  if (req.url === '/bundle.js') {
    fs.readFile(`${__dirname}/../hosted/bundle.js`, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  } else {
    fs.readFile(`${__dirname}/../hosted/index.html`, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
};

const app = http.createServer(handler).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

const io = socketio(app);
const users = {};
let pos = 400;
const onJoined = (sock) => {
  const socket = sock;
  socket.join('room');
  users[socket.id] = Math.ceil(Math.random() * 2) - 1;
  // set background color for each player
  if (users[socket.id] === 0) {
    const data = {
      x: 0,
      y: 0,
      width: 350,
      height: 300,
      color: '#FF0000',
      pos,
    };
    socket.emit('sideChosen', data);
  } else {
    const data = {
      x: 400,
      y: 0,
      width: 400,
      height: 300,
      color: '#0000FF',
      pos,
    };
    socket.emit('sideChosen', data);
  }
  socket.on('move', () => {
    console.log(socket.id);
    if (users[socket.id] === 0) {
      // move left
      pos -= 1;
      const data = {
        pos,
      };
      io.sockets.in('room').emit('update', data);
    } else {
      // move right
      pos += 1;
      const data = {
        pos,
      };
      io.sockets.in('room').emit('update', data);
    }
  });
};

io.sockets.on('connection', (sock) => {
  onJoined(sock);
});


io.sockets.on('disconnnect', (sock) => {
  sock.leave('room');
});
