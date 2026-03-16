const axios = require("axios");

exports.getTable = async (base = "USD") => {

  const response = await axios.get(
    `https://api.frankfurter.app/latest?from=${base}`
  );

  return response.data;
};

