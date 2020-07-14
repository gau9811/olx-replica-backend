const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const socketio = require("socket.io")
const io = socketio(server)
const PORT = process.env.PORT || 4200
const auth = require("./middleware/auth")
const mongoose = require("mongoose")
const ConnectDB = require("./config/db")
const cors = require("cors")
const User = require("./model/user")
const Product = require("./model/Product")
const passport = require("passport")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)

const {
  addUser1,
  addUser2,
  getUserMsg,
  configUser,
  removeUser,
} = require("./chat/users")

//Paspport Middleware
const {ensureAuth} = require("./middleware/passportAuth")

//config passport
require("./config/passport")(passport)

//express-session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
  })
)

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Init middleware
app.use(express.json({extended: false}))

//Init cors
app.use(cors())

// socket.io
io.on("connection", (socket) => {
  socket.on("join1", async ({room, name, email}, callback) => {
    if (error) return callback(error)
    const {user1} = addUser1({
      id: socket.id,
      name: name,
      room: room,
    })

    socket.join(user1.room)

    socket.emit("message", {
      user: "admin",
      text: `${user1.name}, welcome to room ${user1.room}.`,
    })

    const {user2} = addUser2({
      id: socket.id,
      name: name,
      email: email,
      room: room,
    })

    socket.join(user2.room)

    socket.emit("message", {
      text: `${user2.name}, welcome to room ${user2.room}.`,
    })

    configUser({room1: user2.room, room2: user1.room})

    console.log("user connected")
  })

  socket.on("sendMessage", (message, callback) => {
    const user = getUserMsg(socket.id)
    io.to(user.room).emit("message", {user: user.name, text: message})
  })

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      })
    }
  })
})

// connect database
ConnectDB()

// Define Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/user", require("./routes/user"))
app.use("/api/product", require("./routes/product"))
app.use("/auth", require("./routes/googleAuth"))
app.use("/auth", require("./routes/facebookAuth"))

//server listen
server.listen(PORT, () => console.log(`the server is running at ${PORT}`))
