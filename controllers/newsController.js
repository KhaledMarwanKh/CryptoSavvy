const express = require("express");
const axios = require("axios");
const catchasync = require("../utils/catchasync");
const AppError = require("../utils/appError");

const router = express.Router();

exports.getNews = catchasync(async (req, res, next) => {
  const topic =
    req.query.topic || "bitcoin OR ethereum OR crypto OR blockchain";
  const lang = req.query.lang || "en";
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const sources = req.query.sources;
  const sortBy = req.query.sortBy || "publishedAt";
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const inTitle = req.query.inTitle === "true";

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
  if (inTitle) params.in = "title";

  const response = await axios.get("https://gnews.io/api/v4/search", {
    params,
  });
 
  // فلترة المكرر
  let articles = response.data.articles.map((article) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    publishedAt: article.publishedAt,
    source: article.source.name,
    image: article.image || null,
  }));

  articles = articles.filter(
    (article, index, self) =>
      index === self.findIndex((a) => a.title === article.title)
  );

  return res.json({
    status: "success",
    count: articles.length,
    page: page,
    limit: limit,
    articles,
  });
});
