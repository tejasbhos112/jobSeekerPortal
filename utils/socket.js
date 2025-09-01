let io;

function init(server) {
  const socketIO = require('socket.io');
  io = socketIO(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room for user-company 
    socket.on('joinRoom', ({ room }) => {
      socket.join(room);
    });

    // Handle sending messages
    socket.on('chatMessage', ({ room, sender, message }) => {
      io.to(room).emit('chatMessage', { sender, message, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}



module.exports = { init };