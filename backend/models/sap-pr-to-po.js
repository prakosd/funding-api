const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapPrToPo = mongoose.Schema({
    orderNumber: { type: String, required: true },
    prNumber: { type: String, required: true },
    poNumber: { type: String, required: true },
});
sapPrToPo.index({ orderNumber: 1, prNumber: 1, poNumber: 1 }, { unique: true });
sapPrToPo.plugin(uniqueValidator, {
    message : 'Order number, PR Number & PO Number must be unique.'
  });

module.exports = mongoose.model("SapPrToPo", sapPrToPo);
  