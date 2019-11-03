const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapPrToPo = mongoose.Schema({
    orderNumber: { type: String, required: true },
    PrNumber: { type: String, required: true },
    PoNumber: { type: String, required: true },
});
sapPrToPo.index({ orderNumber: 1, PrNumber: 1, PoNumber: 1 }, { unique: true });
sapPrToPo.plugin(uniqueValidator, {
    message : 'Order number, PorNumber & PoNumber must be unique.'
  });

module.exports = mongoose.model("SapPrToPo", sapPrToPo);
  