'use strict'

const socketIOServer = (webServer, roomManager) => {
  const socketIOServer = require('socket.io')(webServer)

  socketIOServer.on('connection', socket => {
    socket.on('new-user', (room, name) => {
      try {
        roomManager.userJoinRoom(room, socket.id, name)
        socket.join(room)
        socket.to(room).broadcast.emit('user-connected', { room, name })
      } catch (err) {
        console.log('Fail new-user: ', err)
      }
    })

    socket.on('post-chat-message', (room, message) => {
      if (typeof room === 'string') {
        try {
          const name = roomManager.getUser(room, socket.id)
          socket.to(room).broadcast.emit('chat-message', { name, message })
        } catch (err) {
          console.log('Fail post-chat-message: ', err)
        }
      }
    })

    socket.on('disconnect', () => {
      try {
        roomManager.getUserRooms(socket.id).forEach(room => {
          socket.to(room).broadcast.emit('user-disconnect', { room, name: roomManager.getUser(room, socket.id) })
          roomManager.removeUserAtRoom(room, socket.id)
        })
      } catch (err) {
        console.log('Fail disconnect: ', err)
      }
    })
  })

  return socketIOServer
}

module.exports.socketIOServer = socketIOServer
