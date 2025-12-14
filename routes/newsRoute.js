const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');
const { getEconomicNews} = require('../controllers/newsEconome');

router.get('/', getNews);
router.get('/economic', getEconomicNews);
module.exports = router;
