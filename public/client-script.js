'use strict'

const CHATSERVICEURL = process.env.CHATSERVICEURL || 'http://localhost:5000'
const socket = io(CHATSERVICEURL)

let roomCreateCallback = null
let messageCallback = null

export function setupRoomArea (roomCreateHandler) {
  roomCreateCallback = roomCreateHandler
}

// const messageElement = document.createElement('div')
// messageElement.innerHTML = messageElement
// messageArea.append(messageElement)
export function setupMessageArea (appendMessageHandler) {
  messageCallback = appendMessageHandler
}

export function requestJoinRoom (roomName, userName) {
  socket.emit('new-user', roomName, userName)
  appendMessage('You joined')
}

export function postMessage (roomName, message) {
  socket.emit('post-chat-message', roomName, message)
  appendMessage(`Your MSG: ${message}`)
}

function appendMessage (message) {
  messageCallback(message)
}

socket.on('room-created', (roomName, hostName) => {
  roomCreateCallback(roomName, hostName)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connect`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})
