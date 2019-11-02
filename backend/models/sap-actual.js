const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapActualSchema = mongoose.Schema({
    orderNumber: { type: String, required: true },
    purchasingNumber: { type: String },
    referenceNumber: { type: String, required: true },
    position: { type: Number, required: true },
    costElement: { type: String },
    name: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    uom: { type: String },
    currency: { type: String, required: true },
    actualValue: { type: Number, required: true },
    documentDate: { type: Date, required: true },
    postingDate: { type: Date, required: true },
    documentType: { type: String },
    headerText: { type: String },
    username: { type: String, required: true },
    isLocked: { type: Boolean, required: true, default: false },
    isLinked: { type: Boolean, required: true, default: true },
    isImported: { type: Boolean, required: true },
    remark: { type: String },
    lastUpdateAt: { type: Date, required: true },
    lastUpdateBy: { type: String, required: true }
});
sapActualSchema.index({ orderNumber: 1, referenceNumber: 1, position: 1 }, { unique: true });
sapActualSchema.plugin(uniqueValidator, {
    message : 'Order number, reference number & position must be unique.'
  });

module.exports = mongoose.model("SapActual", sapActualSchema);
  