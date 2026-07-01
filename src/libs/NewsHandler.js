import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL + "/api/news";
// "https://gnews.io/api/v4/search"
class NewsAPIHandler {
  async getNews(filters) {
    const response = (await axios.get(apiURL, { params: filters })).data;
    return response;
  }
}

const newsHandler = new NewsAPIHandler();

export default newsHandler;
