const express = require("express");
const aiController = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze-sentiment", aiController.analyzeSentiment);
router.get("/market-insights", aiController.getMarketInsights);
router.get("/forecast", aiController.getForecast);
router.post("/chat", aiController.chat);

module.exports = router;
