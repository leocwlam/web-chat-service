'use strict'

{/* <script type="module" src="http://localhost:5000/socket-lib/socket.io.js"></script> */}
// const CHATSERVICEURL = process.env.CHATSERVICEURL || 'http://localhost:5000'
const CHATSERVICEURL = 'http://localhost:5000'


const socket = io(CHATSERVICEURL)

let roomCreatedCallback = null
let messageCallback = null
let chaterJoinRoomCallback = null
let chaterLeaveRoomCallback = null

function setupRoomCreatedHandler (roomCreatedHandler) {
  roomCreatedCallback = roomCreatedHandler
}

function setupChaterJoinRoomHandler (chaterJoinRoomHandler) {
  chaterJoinRoomCallback = chaterJoinRoomHandler
}

function setupChaterLeaveRoomHandler (chaterLeaveRoomHandler) {
  chaterLeaveRoomCallback = chaterLeaveRoomHandler
}

function setupMessageAppendHandler (appendMessageHandler) {
  messageCallback = appendMessageHandler
}

function appendMessage (message) {
  if (messageCallback) {
    messageCallback(message)
  }
}

function requestJoinRoom (roomName, userName) {
  socket.emit('new-user', roomName, userName)
  appendMessage('You joined')
}

function requestLeaveRoom (roomName) {
  socket.emit('disconnect')
  appendMessage(`You request to leave ${roomName}`)
}

function postMessage (roomName, message) {
  socket.emit('post-chat-message', roomName, message)
  appendMessage(`Your MSG: ${message}`)
}



socket.on('room-created', (roomName, hostName) => {
  if (roomCreatedCallback) {
    roomCreatedCallback(roomName, hostName)
  }
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', data => {
  if (chaterJoinRoomCallback) {
    chaterJoinRoomCallback(data.room, data.name)
  }
  appendMessage(`${name} connect`)
})

socket.on('user-disconnected', data => {
  if (chaterLeaveRoomCallback) {
    chaterLeaveRoomCallback(data.room, data.name)
  }
  appendMessage(`${data.name} disconnected`)
})
