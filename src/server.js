'use strict'

const path = require('path')
const http = require('http')
const express = require('express')

const roomManager = require('./room-manager')
const socketServer = require('./socketServer')

const PORT = process.env.PORT || 5000

const ISALLOWCORS = process.env.ALLOWCORS || false

const app = express()
app.use(express.static(path.join(__dirname, '../public')))
app.use(function (req, res, next) {
  if (!ISALLOWCORS) {
    // res.header('Access-Control-Allow-Origin', req.get('Origin') || '*')
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
    res.header('Access-Control-Expose-Headers', 'Content-Length')
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range')
  }
  if (req.method === 'OPTIONS') {
    return res.send(200)
  } else {
    return next()
  }
})
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'jade')

const webServer = http.Server(app)
const socketIOServer = socketServer.socketIOServer(webServer, roomManager)

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

// Create new room
app.post('/room/:roomname/:hostname', (req, res, next) => {
  const room = req.params.roomname
  const host = req.params.hostname
  try {
    if (roomManager.getRoom(room)) {
      throw new Error(`${room} room is already exist`)
    }
    roomManager.createRoom(room, host)
    socketIOServer.emit('room-created', room, host)
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
    res.json((room) || {})
  } catch (err) {
    responseErrorHander(res, err, next)
  }
})

app.get('/', (req, res) => {
  res.status(200)
  res.render('index', { title: 'Chat Service', content: 'Welcome to chat service' })
})

webServer.listen(PORT, () => console.log(`Listening on ${PORT}`))
