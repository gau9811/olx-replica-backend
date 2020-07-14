const GoogleStrategy = require("passport-google-oauth20").Strategy
const LocalStrategy = require("passport-local").Strategy
const User = require("../model/user")
const bcrypt = require("bcryptjs")
const FacebookStrategy = require("passport-facebook").Strategy
require("dotenv").config()

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({usernameField: "email"}, (email, password, done) => {
      // Match user
      User.findOne({
        email: email,
      }).then((user) => {
        if (!user) {
          return done(null, false)
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        })
      })
    })
  )

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ACCESS_KEYID,
        clientSecret: process.env.GOOGLE_SECRET_KEY,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOneAndUpdate(
            {email: profile._json.email},
            {
              googleId: profile.id,
            }
          )
          if (user) {
            done(null, user)
          }
        } catch (err) {
          err
        }
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ACCESS_KEYID,
        clientSecret: process.env.FACEBOOK_SECRET_KEY,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email"],
      },
      async (accessToken, refreshToken, profile, cb) => {
        const newUser = {
          facebookId: profile.id,
          userame: profile._json.email.split("@")[0],
          name: profile.displayName,
          emailId: profile._json.email,
          avatarfacebook: profile._json.picture,
        }

        try {
          let user = await User.findOneAndUpdate({email: profile._json.email})
          if (user) {
            done(null, user)
          } else {
            let users = await User.create(newUser)
            done(null, users)
          }
        } catch (err) {
          err
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user))
  })
}
