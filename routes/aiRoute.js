const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { predictValidator } = require("../middlewares/validator");

// GET /api/ai/health - Check AI service status
router.get("/health", aiController.healthCheck);

// GET /api/ai/models - List all trained models
router.get("/models", aiController.listModels);

// GET /api/ai/predict?symbol=BTCUSDT&interval=1h&candles=500
// Fetches from Binance then sends to AI
router.get("/predict", predictValidator, aiController.getPrediction);

// POST /api/ai/predict/auto - Let AI service handle everything
router.post("/predict/auto", aiController.getAutoPrediction);

// POST /api/ai/train - Train/retrain a model
router.post("/train", aiController.trainModel);

module.exports = router;
