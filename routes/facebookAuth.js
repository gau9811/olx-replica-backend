const express = require("express")
const router = express.Router()
const passport = require("passport")

router.get("/facebook", passport.authenticate("facebook", {scope: ["email"]}))

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {successRedirect: "/bye"})
)

router.get("/logout", (req, res) => {
  req.logout()
  res.redirect("/")
})

module.exports = router