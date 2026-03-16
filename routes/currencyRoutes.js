const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");

router.get("/convert", currencyController.convertCurrency);
router.get("/syp", currencyController.getsyp);
router.get("/CreptoTable", currencyController.getCreptoTable);

module.exports = router;
