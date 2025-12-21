const express = require('express');
const axios = require('axios');
const gemini = require('../utils/gemini');
const cache = require('../utils/cache');

const router = express.Router();

exports.getNews = async (req, res) => {
  try {
    const topic = req.query.topic || 'bitcoin OR ethereum OR crypto OR blockchain';
    const lang = req.query.lang || 'en';
    const fromDate = req.query.from;
    const toDate = req.query.to;
    const sources = req.query.sources;
    const sortBy = req.query.sortBy || 'publishedAt';
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const inTitle = req.query.inTitle === 'true';
    const analyze = req.query.analyze === 'true';

    const cacheKey = `news_${topic}_${lang}_${page}_${limit}_${analyze}`;

    const data = await cache.getOrSet(cacheKey, async () => {
      const params = {
        token: process.env.GNEWS_API_KEY,
        q: topic,
        lang: lang,
        max: limit,
        page: page,
        sortby: sortBy,
      };

      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (sources) params.sources = sources;
      if (inTitle) params.in = 'title';

      const response = await axios.get('https://gnews.io/api/v4/top-headlines', { params });

      let articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        image: article.image || null,
      }));

      articles = articles.filter((article, index, self) =>
        index === self.findIndex(a => a.title === article.title)
      );

      let sentiment = null;
      if (analyze && articles.length > 0) {
        sentiment = await gemini.analyzeNewsSentiment(articles);
      }

      return { articles, sentiment };
    }, 300); // Cache news for 5 minutes

    return res.json({
      status: 'success',
      count: data.articles.length,
      page: page,
      limit: limit,
      articles: data.articles,
      sentiment: data.sentiment,
    });
  } catch (err) {
    console.error('GNEWS ERROR:', err.response?.data || err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news from GNews',
    });
  }
};