const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapCommitmentEta = mongoose.Schema({
    orderNumber: { type: String, required: true },
    documentNumber: { type: String, required: true },
    etaDate: { type: Date, required: true },
    lastUpdateAt: { type: Date, required: true },
    lastUpdateBy: { type: String, required: true }
});
sapCommitmentEta.index({ orderNumber: 1, documentNumber: 1 }, { unique: true });
sapCommitmentEta.plugin(uniqueValidator, {
    message : 'Order number and documentNumber must be unique.'
  });

module.exports = mongoose.model("SapCommitmentEta", sapCommitmentEta);
  