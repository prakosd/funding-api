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

exports.deleteOne = (req, res, next) => {
    const orderNumber = req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const poNumber = req.params.poNumber ? req.params.poNumber.trim() : '';


    const filter = {
        orderNumber: orderNumber,
        poNumber: poNumber
    };

    console.log(filter);
  
    SapPrToPo.deleteMany(filter).then(result => {
      res.status(200).json({ message: "Deleting many successful!" });
     }).catch(error => {
        console.log(error);
        res.status(500).json({ message: "Deleting many failed!" });
     });
  };

exports.upsertOne = (req, res, next) => {
    const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: true, setDefaultsOnInsert: true };

    const orderNumber = req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const prNumber = req.params.prNumber ? req.params.prNumber.trim() : '';
    const poNumber = req.params.poNumber ? req.params.poNumber.trim() : '';

    const filter = {
        orderNumber: orderNumber,
        prNumber: prNumber,
        poNumber: poNumber
    };

    if (orderNumber === '' || prNumber === '' || poNumber === '') {
        console.log(filter);
        res.status(500).json({ message: "Updating failed!", data: filter, error: error });
    }

    let set = {
        orderNumber: orderNumber,
        prNumber: prNumber,
        poNumber: poNumber
    };

SapPrToPo.findOneAndUpdate(filter, set, option)
      .then(result => {
        res.status(200).json({ message: "Updating successful!", data: result });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ message: "Updating failed!", data: result, error: error });
      });
  };