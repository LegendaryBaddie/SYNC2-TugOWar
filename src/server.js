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
const rooms = [];

const onJoined = (sock) => {
  const socket = sock;
  socket.join('room');
  //check if there is any rooms at all
  if(!rooms[0]){
    let roomName = 0;
    socket.join(`${roomName}`);
    rooms[0] = {
      name:roomName,
      player1:socket.id,
      player2:null,
      pos:350
    };
    users[socket.id] = {room: 0, player:'player1'};
    
  }else{
    //check for open rooms 
    if(rooms.length>1){
      for(var i = 1;i<rooms.length+1;i++){
      // if there is an open room join it  
        if((i==rooms.length) && (rooms[i-1].player2 != null))
        {
          roomName = rooms.length-1;
          socket.join(`${roomName}`);
          rooms[roomName] = ({
            name:roomName,
            player1:socket.id,
            player2:null,
            pos:350
          });
          users[socket.id] = {room: roomName, player: 'player1'};
          break;
        }
        else if((rooms[i-1].player2===null) && (rooms[i-1].player1===null)){
          socket.join(`${rooms[i-1].name}`);
          rooms[i-1].player1 = socket.id;
          users[socket.id] = {room: i-1, player:'player1'};
          break;
        }else if((rooms[i-1].player2===null) && (rooms[i-1].player1!=null)){
          socket.join(`${rooms[i-1].name}`);
          rooms[i-1].player2 = socket.id;
          users[socket.id] = {room: i-1, player:'player2'};
          break;
        }
      }
    }else{
      socket.join(`${rooms[0].name}`);
      rooms[0].player2 = socket.id;
      users[socket.id] = {room: 0, player:'player2'};
      rooms[1] = {
        name:1,
        player1:null,
        player2:null,
        pos:350
      };
    // if there is no open rooms make your own
    }
  }

  // set background color for each player
  if (users[socket.id].player ==='player1') {
    const data = {
      x: 0,
      y: 0,
      width: 350,
      height: 300,
      color: '#FF0000',
      pos:350
    };
    socket.emit('sideChosen', data);
  } else {
    const data = {
      x: 400,
      y: 0,
      width: 400,
      height: 300,
      color: '#0000FF',
      pos:350
    };
    socket.emit('sideChosen', data);
  }
  socket.on('move', () => {
    
    let room = users[socket.id].room;
    let pos = rooms[room].pos;
    console.log(rooms[room].player1);
    console.log(socket.id);
    console.log(rooms[room].player2);
    if(rooms[room].player2 != null){
      if (socket.id === rooms[room].player1) {
      // move left
      rooms[room].pos -= 1;
        if(pos === 0 ){
          io.sockets.in(`${rooms[room].name}`).emit('lose');
          socket.emit('win');
        }else{
       const data = {
          apos:pos,
        };
        io.sockets.in(`${rooms[room].name}`).emit('update', data);
        }
      } else {
       // move right
       rooms[room].pos += 1;
       if(pos === 700){
        io.sockets.in(`${rooms[room].name}`).emit('lose');
        socket.emit('win');
      }else{
       const data = {
         apos:pos,
        };
        io.sockets.in(`${rooms[room].name}`).emit('update', data);
        }
      }
    }
  });
};

io.sockets.on('connection', (sock) => {
  onJoined(sock);
});


io.sockets.on('disconnnect', (sock) => {
  let room = users[sock.id].room;
  let data = rooms[room];
  // disconnect both users in that room and remove the room from list
  io.sockets.connected[data.player1].disconnect();
  io.sockets.connected[data.player2].disconnect();
  rooms.splice(room,1);
});
