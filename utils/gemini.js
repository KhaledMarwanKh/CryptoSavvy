const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;

const getGenAI = () => {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not defined in environment variables");
            return null;
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

/**
 * Analyze sentiment of a list of news articles
 * @param {Array} articles - List of article objects
 * @returns {Promise<Object>} Sentiment analysis result
 */
exports.analyzeNewsSentiment = async (articles) => {
    const ai = getGenAI();
    if (!ai) return { error: "AI not configured" };

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert crypto market psychologist and analyst. Analyze the following news articles and provide a sentiment score (0-100).
      
      CRITICAL: You must explain the reasoning behind your score. Why are these news items bullish or bearish? 
      Look for: Regulatory news, adoption, technical hacks, or macro-economic shifts.

      Return the result in JSON format:
      {
        "score": number,
        "sentiment": "Bearish" | "Neutral" | "Bullish",
        "summary": "Short overall summary",
        "reasoning": "Detailed explanation of WHY this sentiment was chosen based on the news provided",
        "key_drivers": ["list of specific factors driving this sentiment"]
      }

      Articles:
      ${articles.map((a, i) => `${i + 1}. Title: ${a.title}\nDescription: ${a.description}`).join("\n\n")}
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
    } catch (err) {
        console.error("Gemini News Sentiment Error:", err.message);
        return { error: err.message };
    }
};

/**
 * Generate market insights based on historical data and sentiment
 * @param {string} symbol - Crypto symbol
 * @param {Object} technicals - Technical indicator data
 * @param {Object} sentiment - Sentiment analysis result
 * @returns {Promise<Object>} Market insights
 */
exports.generateMarketInsights = async (symbol, technicals, sentiment) => {
    const ai = getGenAI();
    if (!ai) return { error: "AI not configured" };

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      As a professional high-frequency crypto trader and technical analyst, analyze ${symbol} using:
      Technical Data: ${JSON.stringify(technicals)}
      News Sentiment Context: ${JSON.stringify(sentiment)}

      You MUST provide an "Explainable AI" (XAI) analysis. Don't just give levels; explain the logic.
      Example: "The RSI is at 75 which indicates an overbought condition, meaning a potential pullback is likely."

      Provide:
      1. Technical Trend Analysis
      2. Support/Resistance logic
      3. Reasoning for your price prediction
      4. Risk Assessment

      Return EXACTLY in this JSON format:
      {
        "trend": "Bullish | Bearish | Neutral",
        "trend_reasoning": "Detailed explanation of the trend based on MA and Price",
        "levels": { 
          "support": "value and why", 
          "resistance": "value and why" 
        },
        "rsi_analysis": "What the RSI tells us right now",
        "prediction": "Short-term outlook",
        "prediction_logic": "Deep dive into why this prediction was made",
        "risk": "Low | Medium | High",
        "risk_factors": ["factor 1", "factor 2"],
        "recommendation": "Buy | Sell | Hold"
      }
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };
    } catch (err) {
        console.error("Gemini Market Insights Error:", err.message);
        return { error: err.message };
    }
};

/**
 * Chat with Gemini about crypto
 * @param {string} message - User message
 * @param {Array} history - Previous messages
 * @returns {Promise<string>} AI response
 */
exports.chatWithAI = async (message, history = []) => {
    const ai = getGenAI();
    if (!ai) return "AI is not configured. Please check GEMINI_API_KEY.";

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.content }],
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (err) {
        console.error("Gemini Chat Error:", err.message);
        return "Sorry, I'm having trouble connecting to my brain right now.";
    }
};
