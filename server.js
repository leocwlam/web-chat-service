'use strict'

const express = require('express')

const roomManager = require('./room-manager')

const PORT = process.env.PORT || 5000
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.use(express.static('public'))
app.use(express.urlencoded({ exteneded: true }))

io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    try {
      roomManager.userJoinRoom(room, socket.id, name)
      socket.join(room)
      socket.to(room).broadcast.emit('user-connected', name)
    } catch (err) {
      console.log('Fail new-user: ', err)
    }
  })

  socket.on('post-chat-message', (room, message) => {
    try {
      const name = roomManager.getUser(room, socket.id)
      socket.to(room).broadcast.emit('chat-message', { name, message })
    } catch (err) {
      console.log('Fail post-chat-message: ', err)
    }
  })

  socket.on('disconnect', () => {
    try {
      roomManager.getUserRooms(socket.id).forEach(room => {
        socket.to(room).broadcast.emit('user-disconnect', roomManager.getUser(room, socket.id))
        roomManager.removeUserAtRoom(room, socket.id)
      })
    } catch (err) {
      console.log('Fail disconnect: ', err)
    }
  })
})

// Create new room
app.post('room/:roomname/:hostname', (req, res, next) => {
  const room = req.parms.roomname
  const host = req.parms.hostname
  try {
    if (roomManager.getRoom(room)) {
      throw new Error('Room is already exist')
    }
    roomManager.createRoom(room, host)
    res.status(200)
    io.emit('room-created', room, host)
  } catch (err) {
    res.status(400)
    next(new Error(err))
  }
})

// Get room information
app.get('rooms', (req, res, next) => {
  try {
    res.status(200)
    res.json(roomManager.getAllRooms())
  } catch (err) {
    res.status(400)
    next(new Error(err))
  }
})

// Get room information
app.get('room/:roomname', (req, res, next) => {
  try {
    res.status(200)
    res.json(roomManager.getRoom(req.parms.roomname))
  } catch (err) {
    res.status(400)
    next(new Error(err))
  }
})

app.get('/', (req, res) => {
  res.status(200)
  res.render('Welcome to chat service')
})

server.listen(PORT, () => console.log(`Listening on ${PORT}`))
