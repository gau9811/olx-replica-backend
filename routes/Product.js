const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const AWS = require("aws-sdk")
require("dotenv").config()
const multer = require("multer")
const Storage = multer.memoryStorage()
const upload = multer({Storage: Storage}).array("photos", 15)
const Product = require("../model/Product")
const User = require("../model/user")
const gravatar = require("gravatar")

const {check, validationResult} = require("express-validator")

// @route    GET api/products
// @desc     Get all products
// @access   Public

router.get("/showCaseCar", async (req, res) => {
  try {
    let product = await Product.find()
    res.json({showcase: product})
  } catch (err) {
    console.error(err)
  }
})

// @route    GET api/products/search
// @desc     find a product by name
// @access   Public
router.get("/search", async (req, res) => {
  const name = req.query.name.toLowerCase()
  const product = await Product.find()
  const productName = product.map((user) => {
    if (
      user.carName.toLowerCase() === name ||
      user.carCompany.toLowerCase() === name
    ) {
      return user
    }
  })

  try {
    if (productName) {
      res.json(productName)
    } else {
      res.json({msg: "There is no product found"})
    }
  } catch (err) {
    res.send(err).status(500)
  }
})

// @route    GET api/products/me/cars
// @desc     Get all  user car by userid
// @access   Private

router.get("/MyCar", async (req, res) => {
  let product = await Product.find({user: req.user.id})

  try {
    res.json({msg: product})
  } catch (err) {
    if (!product) {
      res.status(404).json({msg: "user doesn't uploaded cars"})
    }
  }
})

// @route    GET api/products/Myprofile
// @desc     Get a user by JWTtoken
// @access   Private
router.get("/MyProfile", async (req, res) => {
  let profile = await User.find({_id: req.user.id})
  try {
    res.json({profile: profile})
  } catch (err) {
    if (!profile) {
      res.status(404).json({Msg: "Profile not found"})
    }
  }
})

// @route    POST api/products/Myprofile
// @desc     Update a user by JWTtoken
// @access   Private
router.put(
  "/update/MyProfile",
  [
    check("username").not().isEmpty(),
    check("name").not().isEmpty(),
    check("email").not().isEmpty(),
    check("address").not().isEmpty(),
    check("phonenumber").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    try {
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      })

      let profile = await User.findOneAndUpdate(
        {_id: req.user.id},
        {
          username: req.body.username,
          name: req.body.name,
          email: req.body.email,
          avatar: avatar,
          address: req.body.address,
          phonenumber: req.body.phonenumber,
        }
      )

      res.json({profile: profile})
    } catch (err) {
      if (err) {
        res.status(500).json({Msg: err})
      }
    }
  }
)

// @route    GET api/profile
// @desc     Get the user productby user id
// @access   Private

router.get("/user/:car_id", async (req, res) => {
  let product = await Product.find({
    user: req.user.id,
    _id: req.params.car_id,
  })

  product ? res.json(product) : res.json({Msg: "there is no car on sale"})
})

// @route    POST api/upload a product
// @desc     post
// @access   Private

router.post(
  "/carDescription",
  upload,
 

  [
    check("company").not().isEmpty(),
    check("name").not().isEmpty(),
    check("modelyear").not().isEmpty(),
    check("fueltype").not().isEmpty(),
    check("color").not().isEmpty(),
    check("transmission").not().isEmpty(),
    check("mileage").not().isEmpty(),
    check("Description").not().isEmpty(),
    check("owner").not().isEmpty(),
    check("price").not().isEmpty(),
    check("state").not().isEmpty(),
  ],

  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()})
    }

    // upload to aws

    const file =
      (await req.files.length) <= 2 && !req.files
        ? res.json({msg: "please upload minimum 3 photos of product"})
        : req.files

    let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEYID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    })

    file.map((images) => {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: images.originalname,
        Body: images.buffer,
        ContentType: images.mimetype,
        ACL: "public-read",
      }
      s3bucket.upload(params, (err) => {
        if (err) res.json({error: true, Msg: err})
      })
    })

    const FileLink = process.env.AWS_UPLOAD_FILE_URL
    let filelink = file.map((item) => `${FileLink}${item.originalname}`)

    // upload to mongodb

    User.find(email)

    try {
      let product = await Product({
        user: req.user.id,
        carImg: filelink,
        carCompany: req.body.company.toLowerCase(),
        carName: req.body.name.toLowerCase(),
        carYear: req.body.modelyear,
        carFuel: req.body.fueltype,
        carColor: req.body.color,
        TransmissionType: req.body.transmission,
        carMileage: req.body.mileage,
        carDescription: req.body.Description,
        NoOfOwner: req.body.owner,
        carSetPrice: req.body.price,
        State: req.body.state,
      })
      await product.save()
      res.json({Msg: "The Product is uploaded"})
    } catch (err) {
      res.status(500).send("Server Error")
    }
  }
)

// @route    UPDATE api/car/update/:CarId
// @desc     Update a current car configuration
// @access   Private

router.put(
  "/carSale/update/:CarId",
  upload,
  
  [
    check("company").not().isEmpty(),
    check("name").not().isEmpty(),
    check("modelyear").not().isEmpty(),
    check("fueltype").not().isEmpty(),
    check("color").not().isEmpty(),
    check("transmission").not().isEmpty(),
    check("mileage").not().isEmpty(),
    check("Description").not().isEmpty(),
    check("owner").not().isEmpty(),
    check("price").not().isEmpty(),
    check("state").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()})
    }

    // upload to aws

    const file =
      (await req.files.length) <= 2 && !req.files
        ? res.json({Msg: "please upload minimum 3 photos of product"})
        : req.files

    let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEYID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    })

    file.map((images) => {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: images.originalname,
        Body: images.buffer,
        ContentType: images.mimetype,
        ACL: "public-read",
      }

      s3bucket.upload(params, (err) => {
        if (err) res.json({Msg: err})
      })
    })

    const FileLink = process.env.AWS_UPLOAD_FILE_URL
    let filelink = file.map((item) => `${FileLink}${item.originalname}`)

    // update the current Object using id upload to mongodb
    const user = {
      user: req.user.id,
      _id: req.params.CarId,
    }

    try {
      let product = await Product.findOneAndUpdate(user, {
        carImg: filelink,
        carCompany: req.body.company,
        carName: req.body.name,
        carYear: req.body.modelyear,
        carFuel: req.body.fueltype,
        carColor: req.body.color,
        TransmissionType: req.body.transmission,
        carMileage: req.body.mileage,
        carDescription: req.body.Description,
        NoOfOwner: req.body.owner,
        carSetPrice: req.body.price,
        State: req.body.state,
      })

      !product && !image
        ? res.json({
            Msg: "There is no product that you are looking for ",
          })
        : res.json({Msg: "Product has been succesfully updated"})
    } catch (err) {
      res.status(500).json({Msg: "server error"})
    }
  }
)

// @route    DELETE api/profile/productdelete/:id
// @desc     delete the user productby user id
// @access   Private

router.delete("/productdelete/:id", async (req, res) => {
  try {
    let product = await Product.findOne({
      user: req.user.id,
      _id: req.params.id,
    })

    let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEYID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    })

    product.carImg.map((images) => {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: images.slice(33),
      }

      s3bucket.deleteObject(params, (err) => {
        if (err) res.json({Msg: err})
      })
    })

    let userProductdelete = await Product.findOneAndDelete({
      user: req.user.id,
      _id: req.params.Id,
    })

    userProductdelete
      ? res.json({Msg: "success deleted"})
      : res.json({Msg: "failed the product is not deleted"})
  } catch (err) {
    res.status(500).json({Msg: "internal server error"})
  }
})

// @route    DELETE api/profile/userdelete/
// @desc     delete the user
// @access   Private

router.delete("/userdelete", async (req, res) => {
  try {
    let product = await Product.find({
      user: req.user.id,
    })

    let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEYID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    })

    product.map((user) => {
      user.carImg.map((images) => {
        const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: images.slice(33),
        }
        s3bucket.deleteObject(params, (err) => {
          if (err) res.json({Msg: err})
        })
      })
    })

    await Product.deleteMany({
      user: req.user.id,
    })

    await User.deleteOne({
      _id: req.user.id,
    })

    res.json({Msg: "User deleted"})
  } catch (error) {
    res.status(500).json({Msg: "Internel server error"})
  }
})

// @route    GET api/product/chat
// @desc     post the chat between two users
// @access   Public

router.get("/chat/:user1/:user2", async (req, res) => {
  const product = await Product.findOne({
    user: req.params.user1,
  }).populate("user", ["username", "email"])

  const users = await User.findOne({
    _id: req.params.user2,
  })
  const data = {
    user1: product.user.username,
    user1Id: product.user.email,
    user2: users.username,
  }
  try {
    if (data) res.json(data)
    res.json({msg: "There is no username"})
  } catch (error) {
    res.send(error).status(500)
  }
})

module.exports = router
