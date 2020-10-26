'use strict'

const path = require('path')
const http = require('http')
const express = require('express')

const roomManager = require('./room-manager')

const PORT = process.env.PORT || 5000
const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(function (req, res, next) {
  // res.header('Access-Control-Allow-Origin', req.get('Origin') || '*')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  res.header('Access-Control-Expose-Headers', 'Content-Length')
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range')
  if (req.method === 'OPTIONS') {
    return res.send(200)
  } else {
    return next()
  }
})
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

const server = http.Server(app)
const io = require('socket.io')(server)

io.on('connection', socket => {
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

const transformRoomToContract = (room) => {
  const roomContract = { ...room }
  roomContract.users = Array.from(roomContract.users.values())
  return roomContract
}

const responseErrorHander = (res, err, next) => {
  res.status(400)
  if (typeof next === 'function') {
    if (err.message) {
      next(err.message)
    } else {
      next(err)
    }
  }
}

// const setupHeader = (response) => {
//   response.set('Content-Type', 'application/json')
//   response.set('Access-Control-Allow-Origin', '*')
// }

// Create new room
app.post('/room/:roomname/:hostname', (req, res, next) => {
  const room = req.params.roomname
  const host = req.params.hostname
  try {
    if (roomManager.getRoom(room)) {
      throw new Error(`${room} room is already exist`)
    }
    roomManager.createRoom(room, host)
    io.emit('room-created', room, host)
    // setupHeader(res)
    res.status(200)
    res.json(transformRoomToContract(roomManager.getRoom(room)))
  } catch (err) {
    responseErrorHander(res, err, next)
  }
})

// Get all rooms information
app.get('/rooms', (req, res, next) => {
  try {
    res.status(200)
    // setupHeader(res)
    const rooms = []
    for (const room of roomManager.getAllRooms()) {
      rooms.push(transformRoomToContract(room))
    }
    res.json(rooms)
  } catch (err) {
    responseErrorHander(res, err, next)
  }
})

// Get room information
app.get('/room/:roomname', (req, res, next) => {
  try {
    res.status(200)
    const room = transformRoomToContract(roomManager.getRoom(req.params.roomname))
    // setupHeader(res)
    res.json((room) || {})
  } catch (err) {
    responseErrorHander(res, err, next)
  }
})

app.get('/', (req, res) => {
  res.status(200)
  res.render('index', { title: 'Chat Service', content: 'Welcome to chat service' })
})

server.listen(PORT, () => console.log(`Listening on ${PORT}`))
