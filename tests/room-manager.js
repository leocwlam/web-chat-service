'use strict'
/* eslint-env mocha */

const chai = require('chai')
const { expect } = chai

const roomManager = require('../room-manager')

describe('room-manager Tests', function () {
  describe('Room Tests', function () {
    it('Success create a room', function () {
      try {
        const newRoom = roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        expect(newRoom.expireDate).to.not.equal(null)
        expect(newRoom.hostName).to.equal('tester')
        expect(newRoom.users.get(1)).to.equal('tester')
      } finally {
        roomManager.removeRoom('Public')
      }
    })

    it('Fail create a existing room', function () {
      try {
        roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        expect(() => roomManager.createRoom('Public', 2, 'tester2')).to.throw()
      } finally {
        roomManager.removeRoom('Public')
      }
    })

    it('Success get room', function () {
      try {
        roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        expect((roomManager.getRoom('Public') !== undefined)).to.equal(true)
        expect(roomManager.getRoom('Public').expireDate > new Date().setMinutes(new Date().getMinutes() + 59)).to.equal(true)
        expect(roomManager.getRoom('Public').expireDate <= new Date().setHours(new Date().getHours() + 1)).to.equal(true)
        expect(roomManager.getRoom('Public').hostName).to.equal('tester')
        expect(roomManager.getRoom('Public').users.get(1)).to.equal('tester')
      } finally {
        roomManager.removeRoom('Public')
      }
    })

    it('Fail get no exist room', function () {
      expect((roomManager.getRoom('No exist room') === undefined)).to.equal(true)
    })

    it('Success Add and Remove User inside the room', function () {
      expect(roomManager.checkRoomExist('Public')).to.equal(false)
      roomManager.createRoom('Public', 'tester')
      roomManager.userJoinRoom('Public', 1, 'tester')
      roomManager.removeUserAtRoom('Public', 1)
    })

    it('Success remove User no inside the room', function () {
      try {
        expect(roomManager.checkRoomExist('Public')).to.equal(false)
        roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        roomManager.removeUserAtRoom('Public', 2)
      } finally {
        roomManager.removeRoom('Public')
      }
    })

    it('Fail Remove User Room no exist', function () {
      expect(roomManager.checkRoomExist('Public')).to.equal(false)
      expect(() => roomManager.removeUserAtRoom('Public', 1)).to.throw()
    })

    it('Success new user join existing room', function () {
      try {
        roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        roomManager.userJoinRoom('Public', 2, 'tester2')
      } finally {
        roomManager.removeRoom('Public')
        roomManager.removeRoom('Public')
      }
    })

    it('Fail new user join no exist room', function () {
      expect(() => roomManager.userJoinRoom('Public', 1, 'tester')).to.throw()
    })

    it('Success Get user from a room', function () {
      try {
        const newRoom = roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        const user = roomManager.getUser('Public', 1)
        expect(newRoom.users.get(1)).to.equal(user)
      } finally {
        roomManager.removeRoom('Public')
      }
    })

    it('Fail no existing room', function () {
      expect(() => { roomManager.getUser('No existing room', 1) }).to.throw()
    })

    it('Fail get user no inside a room', function () {
      try {
        roomManager.createRoom('Public', 'tester', false)
        expect(() => { roomManager.getUser('Public', 1) }).to.throw()
      } finally {
        roomManager.removeRoom('Public')
      }
    })

    it('Success get all rooms', function () {
      try {
        roomManager.createRoom('Public', 'tester', false)
        roomManager.createRoom('Family', 'tester', false)
        const rooms = roomManager.getAllRooms()
        expect(rooms.length).to.equal(2)
        expect(rooms.filter(room => room.room === 'Public')[0].room).to.equal('Public')
        expect(rooms.filter(room => room.room === 'Family')[0].room).to.equal('Family')
      } finally {
        roomManager.removeRoom('Family')
        roomManager.removeRoom('Public')
      }
    })

    it('Success get no room from given user', function () {
      const rooms = roomManager.getUserRooms(1)
      expect(rooms.length).to.equal(0)
    })

    it('Success get room from given user', function () {
      try {
        roomManager.createRoom('Public', 'tester')
        roomManager.userJoinRoom('Public', 1, 'tester')
        roomManager.createRoom('Family', 'tester2')
        roomManager.userJoinRoom('Family', 2, 'tester2')

        let rooms = roomManager.getUserRooms(1)
        expect(rooms.length).to.equal(1)
        expect(rooms[0]).to.equal('Public')

        rooms = roomManager.getUserRooms(2)
        expect(rooms.length).to.equal(1)
        expect(rooms[0]).to.equal('Family')
      } finally {
        roomManager.removeRoom('Family')
        roomManager.removeRoom('Public')
      }
    })

    it('Success no room from no existing user', function () {
      try {
        roomManager.createRoom('Public', 'tester1')
        roomManager.createRoom('Family', 'tester2')
        const rooms = roomManager.getUserRooms(1)
        expect(rooms.length).to.equal(0)
      } finally {
        roomManager.removeRoom('Family')
        roomManager.removeRoom('Public')
      }
    })

    it('Fail excess create number of room limited', function () {
      try {
        roomManager.createRoom('Public', 'tester1')
        roomManager.createRoom('Family', 'tester2')
        roomManager.createRoom('Private Room 1', 'tester3')
        roomManager.createRoom('Private Room 2', 'tester4')
        roomManager.createRoom('Private Room 3', 'tester5')
        roomManager.createRoom('Private Room 4', 'tester6')
        roomManager.createRoom('Private Room 5', 'tester7')
        roomManager.createRoom('Private Room 6', 'tester8')
        roomManager.createRoom('Private Room 7', 'tester9')
        roomManager.createRoom('Private Room 8', 'tester10')
        expect(() => { roomManager.createRoom('Private Room 9', 'tester11') }).to.throw()
      } finally {
        roomManager.removeRoom('Private Room 8')
        roomManager.removeRoom('Private Room 7')
        roomManager.removeRoom('Private Room 6')
        roomManager.removeRoom('Private Room 5')
        roomManager.removeRoom('Private Room 4')
        roomManager.removeRoom('Private Room 3')
        roomManager.removeRoom('Private Room 2')
        roomManager.removeRoom('Private Room 1')
        roomManager.removeRoom('Family')
        roomManager.removeRoom('Public')
      }
    })
  })
})
