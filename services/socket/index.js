let io;
module.exports = {
  init: httpServer => {
    io = require('socket.io')(httpServer);
    return io;
  },
  connectionIO: io => {
    io.on('connection', socket => {
      console.log('WS connected');
    })
  },
  getIO: () => {
    if (!io) {
      throw new Error('socket.io is not initialized!');
    }
    return io;
  }
}