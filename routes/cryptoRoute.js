const express = require('express');
const router = express.Router();
const { getCryptoHistory } = require('../controllers/cryptoController');
const { getCryptoHistoryValidator } = require('../middlewares/validator');

router.get('/history', getCryptoHistoryValidator, getCryptoHistory);

module.exports = router;
