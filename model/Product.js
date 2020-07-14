const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ProductSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  googleId: {
    type: "string",
    ref: "GoogleUser",
  },

  facebookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FacebookUser",
  },

  carImg: {
    type: Array,
  },
  carCompany: {
    type: String,
  },
  carName: {
    type: String,
  },
  carYear: {
    type: Number,
  },
  carFuel: {
    type: String,
  },
  carColor: {
    type: String,
  },
  TransmissionType: {
    type: String,
  },
  carMileage: {
    type: String,
  },
  carDescription: {
    type: String,
  },
  NoOfOwner: {
    type: String,
  },
  carSetPrice: {
    type: String,
  },
  State: {
    type: String,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = Product = mongoose.model("product", ProductSchema)
