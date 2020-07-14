const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult} = require("express-validator/check")
const gravatar = require("gravatar")
const User = require("../model/user")
const nodemailer = require("nodemailer")
require("dotenv").config()

// @route    POST api/user/register
// @desc      Register the  user
// @access   Private

router.post(
  "/register",
  [
    check("username").not().isEmpty(),
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({min: 8}),
    check("address").not().isEmpty(),
    check("phonenumber").isLength({min: 10}),
  ],
  async (req, res) => {
    let error = validationResult(req)
    if (!error.isEmpty()) {
      res.status(422).json({error: error.array()})
    }
    const {username, name, email, password, address, phonenumber} = req.body

    try {
      let user = await User.findOne({email})
      if (user) {
        res.json({msg: "user already exist"})
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      })

      user = new User({
        username,
        name,
        email,
        password,
        avatar,
        address,
        phonenumber,
      })

      const salt = await bcrypt.genSalt(10)

      user.password = await bcrypt.hash(password, salt)

      user.save()

      res.json({msg: "user created"})

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

      let info = await transporter.sendMail({
        from: '"CarSale 🚗🚘" ,CarSale@gmail.com',
        to: `${email}`,
        subject: `Registeration`,
        text: `Hi ${name} you have just register on our website.Thank you for seeing Cars  from our website and wish you a happy shopping`, // plain text body
      })
      info.messageId
      await nodemailer.getTestMessageUrl(info)
    } catch (error) {
      console.error(error)
      res.status(500).json({msg: "internal server error"})
    }
  }
)

router.delete("/userDelete/:id", async (req, res) => {
  try {
    let user = await User.findOneAndDelete({
      _id: req.params.id,
    })

    if (!user) {
      res.json({msg: "user deleted"})
    } else {
      res.json({msg: "user is not deleted"})
    }
  } catch (err) {
    console.error(err)
  }
})

module.exports = router
