const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/', adminController.admin_index) // admin isteği gelince controllerla yönlendirme yapıyor



module.exports = router