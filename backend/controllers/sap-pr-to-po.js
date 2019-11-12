const SapPrToPo = require("../models/sap-pr-to-po");

exports.getPrNumber = (orderNumber, poNumber) => {
    return SapPrToPo.findOne()
      .where('orderNumber').equals(orderNumber)
      .where('poNumber').equals(poNumber)
      .select('prNumber');
};

exports.getMany = (req, res, next) => {
    const orderNumber =  req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const prNumber = req.params.prNumber ? req.params.prNumber.trim() : '';
    const poNumber = req.params.poNumber ? req.params.poNumber.trim() : '';

    let query = SapPrToPo.find();
    if (orderNumber !== '' && orderNumber !== 'ordernumbers') {  query.where('orderNumber').equals(orderNumber); }
    if (prNumber !== '' && prNumber !== 'prs') {  query.where('prNumber').equals(prNumber); }
    if (poNumber !== ''&& poNumber !== 'pos') {  query.where('poNumber').equals(poNumber); }

    query.sort('orderNumber prNumber poNumber');

    query.then(result => {
        res.status(200).json({ message: "Fetching many successfully!", data: result });})
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: "Fetching many failed!" });
    });  
};