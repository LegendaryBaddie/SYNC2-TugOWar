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
  } else if (req.url === '/style.css') {
    fs.readFile(`${__dirname}/../hosted/style.css`, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/css' });
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
const users = [];
const rooms = [];

const onJoined = (sock) => {
  const socket = sock;
  socket.join('room');
  // check if there is any rooms at all
  if (!rooms[0]) {
    const roomName = 0;
    socket.join(`${roomName}`);
    rooms[0] = {
      name: roomName,
      player1: socket.id,
      player2: null,
      pos: 390,
    };
    users[socket.id] = { room: 0, player: 'player1' };
  } else if (rooms[0]) {
    // check for open rooms 
    if (rooms.length > 1) {
      for (let i = 1; i < rooms.length + 1; i++) {
      // if there is an open room join it  
      // loop through all the rooms and check if it has two non null players
        if ((i === rooms.length) && (rooms[i - 1].player2 != null)) {
          const roomName = rooms.length - 1;
          socket.join(`${roomName}`);
          rooms[roomName] = ({
            name: roomName,
            player1: socket.id,
            player2: null,
            pos: 350,
          });
          users[socket.id] = { room: roomName, player: 'player1' };
          break;
        } else if ((rooms[i - 1].player2 === null) && (rooms[i - 1].player1 === null)) {
          socket.join(`${rooms[i - 1].name}`);
          rooms[i - 1].player1 = socket.id;
          users[socket.id] = { room: i - 1, player: 'player1' };
          break;
        } else if ((rooms[i - 1].player2 === null) && (rooms[i - 1].player1 != null)) {
          socket.join(`${rooms[i - 1].name}`);
          rooms[i - 1].player2 = socket.id;
          users[socket.id] = { room: i - 1, player: 'player2' };
          break;
        }
      }
    } else {
      socket.join(`${rooms[0].name}`);
      rooms[0].player2 = socket.id;
      users[socket.id] = { room: 0, player: 'player2' };
      rooms[1] = {
        name: 1,
        player1: null,
        player2: null,
        pos: 350,
      };
    // if there is no open rooms make your own
    }
  }

  // set background color for each player
  if (users[socket.id].player === 'player1') {
    const data = {
      x: 0,
      y: 0,
      width: 350,
      height: 300,
      color: '#FF0000',
      pos: 390,
    };
    socket.emit('sideChosen', data);
  } else {
    const data = {
      x: 450,
      y: 0,
      width: 350,
      height: 300,
      color: '#0000FF',
      pos: 390,
    };
    socket.emit('sideChosen', data);
  }
  socket.on('move', () => {
    const room = users[socket.id].room;
    const pos = rooms[room].pos;
    if (rooms[room].player2 != null) {
      if (socket.id === rooms[room].player1) {
      // move left
        rooms[room].pos -= 3;
        if (pos === 0) {
          io.sockets.in(`${rooms[room].name}`).emit('lose');
          socket.emit('win');
        } else {
          const data = {
            apos: pos,
          };
          io.sockets.in(`${rooms[room].name}`).emit('update', data);
        }
      } else {
        // move right
        rooms[room].pos += 3;
        if (pos === 775) {
          io.sockets.in(`${rooms[room].name}`).emit('lose');
          socket.emit('win');
        } else {
          const data = {
            apos: pos,
          };
          io.sockets.in(`${rooms[room].name}`).emit('update', data);
        }
      }
    }
  });
};

io.sockets.on('connection', (sock) => {
  onJoined(sock);

  sock.on('disconnect', () => {
    const room = users[sock.id].room;
    const data = rooms[room];
    // disconnect other user in that room and remove the room from list
    if (data.player2 != null && data.player1 != null) {
      io.sockets.in(`${data.name}`).emit('win');
      sock.emit('lose');
    }
  });
});

