'use strict'
const moment = require('moment')

const MAXROOMSLIMIT = process.env.MAXROOMSLIMIT || 10

const rooms = new Map()

const createRoom = function (roomName, hostName, isRequireHost = true) {
  if (rooms.size >= MAXROOMSLIMIT) {
    throw new Error('Server exceed holding maximum number of rooms limit')
  }

  if (checkRoomExist(roomName)) {
    throw new Error('Room is already existed')
  }

  rooms.set(roomName, {
    expireDate: moment().add(1, 'hours'),
    hostName,
    isRequireHost,
    users: new Map()
  })

  return rooms.get(roomName)
}

const checkRoomExist = function (roomName) {
  return rooms.has(roomName)
}

const removeUserAtRoom = function (roomName, socketId) {
  const room = rooms.get(roomName)
  if (!room) {
    throw new Error('Room does not exist')
  }
  const user = room.users.get(socketId)
  room.users.delete(socketId)

  // drop room with no user
  if ((room.users.size === 0) && (room.isRequireHost) && (user === room.hostName)) {
    rooms.delete(roomName)
  }
}

const userJoinRoom = function (roomName, socketId, userName) {
  if (!rooms.get(roomName)) {
    throw new Error('Room does not exist')
  }
  rooms.get(roomName).users.set(socketId, userName) // Change the user name
}

const getAllRooms = function () {
  return Array.from(rooms.keys())
}

const getRoom = function (roomName) {
  return rooms.get(roomName)
}

const removeRoom = function (roomName) {
  return rooms.delete(roomName)
}

const getUser = function (roomName, socketId) {
  if (!checkRoomExist(roomName)) {
    throw new Error('Room does not existed')
  }
  if (!rooms.get(roomName).users.has(socketId)) {
    throw new Error('User does not existed')
  }
  return rooms.get(roomName).users.get(socketId)
}

const getUserRooms = function (socketId) {
  const result = []
  rooms.forEach((value, roomName) => {
    if (value.users.has(socketId)) result.push(roomName)
  })
  return result
}

module.exports.createRoom = createRoom
module.exports.getAllRooms = getAllRooms
module.exports.getRoom = getRoom
module.exports.removeRoom = removeRoom
module.exports.checkRoomExist = checkRoomExist
module.exports.removeUserAtRoom = removeUserAtRoom
module.exports.userJoinRoom = userJoinRoom
module.exports.getUser = getUser
module.exports.getUserRooms = getUserRooms
