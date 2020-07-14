var users = []
var userRoom = []
const nodemailer = require("nodemailer")
require("dotenv").config()

const addUser1 = ({id, name, room}) => {
  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  )

  if (!name || !room) return {error: "Username and room are required."}

  if (existingUser) return {error: "Username is taken."}

  const user1 = {id, name, room}

  users.push(user1)

  return {user1}
}

const addUser2 = ({id, name, email, room}) => {
  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  )

  if (!name || !room) return {error: "Username and room are required."}

  if (existingUser) return {error: "Username is taken."}

  const user2 = {id, name, room}
  users.push(user2)
  let RoomFilter = users.filter((user) => user.room == room)
  if (RoomFilter.length == 2) {
    let transporter = nodemailer.createTransport({
      pool: true,
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    })
    let info = transporter
      .sendMail({
        from: '"CarSale 🚗🚘" ,CarSale@gmail.com',
        to: `${email}`,
        subject: `Chat-time`,
        text: `Hi ${name}. Someone want you to Join the chat And want to Buy or Sell the Car or it's Accesories. The Room no is ${room}.Please Don't share any of Personal detail like Address,Phone number,any bank related Information,room number etc.Happy chatting🙂 `,
      })
      .then((success) => console.log(success))
      .catch((err) => console.log(err))
    info.messageId
    nodemailer.getTestMessageUrl(info)
  }

  return {user2}
}

const configUser = ({room1, room2}) => {
  let result = users.filter((user) => user.room === room1)

  let userLength = users.filter(
    (user) => user.room === room1 && result.length == 4 && user.room === room2
  )

  let user = userLength.splice(1, 2)
  for (let i = 0; i < user.length; i++) {
    userRoom.push(user[i])
  }

  console.log(users)
}

const removeUser = (id) => {
  users.splice((user) => {
    if (user.id != id) {
      return user
    }
    if (user.id == id) {
      return user
    }
  })
  const removeUsersRoom = userRoom.findIndex((user) => user.id === id)
  if (removeUsersRoom !== -1) return users.splice(removeUsersRoom, 1)[0]
}

const getUserMsg = (id) => userRoom.find((user) => user.id === id)

module.exports = {
  addUser1,
  addUser2,
  getUserMsg,
  configUser,
  removeUser,
}
