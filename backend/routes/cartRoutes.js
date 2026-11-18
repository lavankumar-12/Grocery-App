const controller = require('../controllers/cartController')
const email = require('../middleware/emailMiddleware')
const express = require('express')
const router = express.Router()

router.post('/add-to-cart',email.emailMiddleware, controller.addToCart);
router.get('/cart-details',email.emailMiddleware,controller.getCartItems);
router.delete('/remove-item/:productId',email.emailMiddleware,controller.removeCartItem)
module.exports  = router
