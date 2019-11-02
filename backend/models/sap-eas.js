const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const sapEasSchema = mongoose.Schema({
    requisitionNumber: { type: String, required: true, unique: true },
    subject: { type: String },
    currency: { type: String, default: 'IDR' },
    amount: { type: Number, required: true },
    dept: { type: String },
    costCenter: { type: String },
    requestor: { type: String },
    status: { type: String },
    creationDate: { type: Date, required: true },
    approver: { type: String },
    recipient: { type: String },
    etaRequest: { type: Date, required: true },
    isLocked: { type: Boolean, required: true, default: false },
    isLinked: { type: Boolean, required: true, default: true },
    isImported: { type: Boolean, required: true },
    remark: { type: String },
    lastUpdateAt: { type: Date, required: true },
    lastUpdateBy: { type: String, required: true }
});
sapEasSchema.plugin(uniqueValidator, {
    message : 'Requisition number must be unique.'
  });

module.exports = mongoose.model("SapEas", sapEasSchema);
  