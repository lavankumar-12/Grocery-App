const controller= require('../controllers/AdminController')
const { adminMiddleware } = require('../middleware/adminMiddleware')
const express = require('express')

const router = express.Router()

router.post('/admin-register',controller.adminRegister)
router.post('/admin-login',controller.adminLogin)
router.get('/verify',adminMiddleware,controller.verifyAdmin)

module.exports = router

