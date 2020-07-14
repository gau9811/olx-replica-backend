const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  facebookId: {
    type: String,
  },
  googleId: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  avatar: {
    type: String,
  },
  avatarfacebook: {
    type: Object,
  },
  address: {
    type: String,
  },
  phonenumber: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
})

module.exports = User = mongoose.model("user", UserSchema)
