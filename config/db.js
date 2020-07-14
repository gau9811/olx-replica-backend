const mongoose = require("mongoose")
const config = require("config")
const db = config.get("Mongo")

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    if (!connect) {
      console.log("mongodb is not connected")
      // Exit process with failure
      process.exit(1)
    } else {
      console.log("mongodb connected you are ready to go")
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = connectDB
