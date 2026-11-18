const productController = require('../controllers/ProductController')
const upload = require('../middleware/imageMiddleware')
const protected = require('../middleware/adminMiddleware')
const searchController = require('../controllers/searchController')

const express = require('express')

const router = express.Router()

router.post('/add-product', protected.adminMiddleware, upload.single("image"), productController.createProduct)

router.get('/show-products',productController.getProducts)

router.get('/search', searchController)

module.exports= router;