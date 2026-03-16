const exchangeService = require("../services/exchangeService");
const catchasync = require("../utils/catchasync");
const AppError = require("../utils/appError");
const spyService = require("../services/sypService");
const creptoTable = require("../services/creptoTable");



exports.convertCurrency = catchasync(async (req, res, next) => {
  const { from, to, amount } = req.query;
  if (!from || !to || !amount) {
    return next(new AppError("from, to, amount are required", 400));
  }
  const result = await exchangeService.convert(from, to, Number(amount));
  res.json(result);
}); 



exports.getsyp = catchasync(async (req, res, next) => {
  const result = await spyService.getRates();
  res.json({ price: result });

});

exports.getCreptoTable = catchasync(async (req, res, next) => {
  const { from } = req.query;
  if (!from) {
    return next(new AppError("from is required", 400));
  }
  const result = await creptoTable.getTable(from);
  res.json(result);
});
