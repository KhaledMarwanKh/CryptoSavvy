const express = require('express');
const axios = require('axios');

const router = express.Router();

const GNEWS_API_KEY = '762f04f672b496f842fefa4e61f5ff49';
exports.getNews = async (req, res) => {
  try {
    const topic =
      req.query.topic ||
      'bitcoin OR ethereum OR crypto OR blockchain';

    const maxResults = 10;

    const response = await axios.get(
      'https://gnews.io/api/v4/top-headlines',
      {
        params: {
          token: GNEWS_API_KEY,
          q: topic,
          ang: 'en',
          max: maxResults,
        },
      }
    );

    const articles = response.data.articles.map(
      (article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        image: article.image || null,
      })
    );

    return res.json({
      status: 'success',
      count: articles.length,
      articles,
    });
  } catch (err) {
    console.error(
      'GNEWS ERROR:',
      err.response?.data || err.message
    );

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news from GNews',
    });
  }
};
