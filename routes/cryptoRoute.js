const express = require('express');
const router = express.Router();
const { getCryptoHistory } = require('../controllers/cryptoController');

router.get('/history', getCryptoHistory);

module.exports = router;
