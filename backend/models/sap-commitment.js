const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapCommitmentSchema = mongoose.Schema({
    orderNumber: { type: String, required: true },
    category: { type: String, required: true },
    documentNumber: { type: String, required: true },
    position: { type: Number, required: true },
    costElement: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    uom: { type: String, required: true },
    currency: { type: String, required: true },
    actualValue: { type: Number, required: true },
    planValue: { type: Number, required: true },
    documentDate: { type: Date, required: true },
    debitDate: { type: Date, required: true },
    username: { type: String, required: true },
    lastUpdateAt: { type: Date, required: true },
    lastUpdateBy: { type: String, required: true },
    isLocked: { type: Boolean, required: true, default: false },
    isLinked: { type: Boolean, required: true, default: true }
});
sapCommitmentSchema.index({ orderNumber: 1, documentNumber: 1, position: 1 }, { unique: true });
sapCommitmentSchema.plugin(uniqueValidator, {
    message : 'Order number, document Number & position must be unique.'
  });

module.exports = mongoose.model("SapCommitment", sapCommitmentSchema);
  