const express = require("express")
const router = express.Router()
const passport = require("passport")

// @route    POST api/auth/login
// @desc     Get user by login and give token
// @access   Private
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/showcase",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next)
})

module.exports = router
