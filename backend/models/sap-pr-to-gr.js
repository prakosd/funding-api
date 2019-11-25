const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapPrToGr = mongoose.Schema({
    orderNumber: { type: String, required: true },
    prNumber: { type: String, required: true },
    grNumber: { type: String, required: true },
});
sapPrToGr.index({ orderNumber: 1, prNumber: 1, grNumber: 1 }, { unique: true });
sapPrToGr.plugin(uniqueValidator, {
    message : 'Order number, PR Number & GR Number must be unique.'
  });

module.exports = mongoose.model("SapPrToGr", sapPrToGr);
  