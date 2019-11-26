const SapCommitmentEta = require("../models/sap-commitment-eta");

exports.getEtaDate = (orderNumber, documentNumber) => {
    return SapCommitmentEta.findOne()
        .where('orderNumber').equals(orderNumber)
        .where('documentNumber').equals(documentNumber)
        .select('etaDate');
};

exports.getMany = (req, res, next) => {
    const orderNumber =  req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const documentNumber = req.params.documentNumber ? req.params.documentNumber.trim() : '';

    let query = SapCommitmentEta.find();
    if (orderNumber !== '' && orderNumber !== 'ordernumbers') {  query.where('orderNumber').equals(orderNumber); }
    if (documentNumber !== '' && documentNumber !== 'documentNumbers') {  query.where('documentNumber').equals(documentNumber); }

    query.sort('-lastUpdateAt');
    query.then(result => {
        res.status(200).json({ message: "Fetching many successfully!", data: result });})
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: "Fetching many failed!" });
    });  
};

exports.deleteOne = (req, res, next) => {
    const orderNumber =  req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const documentNumber = req.params.documentNumber ? req.params.documentNumber.trim() : '';

    const filter = {
        orderNumber: orderNumber,
        documentNumber: documentNumber
    };

    SapCommitmentEta.deleteMany(filter).then(result => {
        res.status(200).json({ message: "Deleting many successful!" });
       }).catch(error => {
          console.log(error);
          res.status(500).json({ message: "Deleting many failed!" });
    });
};

exports.upsertOne = (req, res, next) => {
    const option = { runValidators: true, context: 'query',
                    useFindAndModify: false, new: true,
                    upsert: true, setDefaultsOnInsert: true };

    const orderNumber = req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const documentNumber = req.params.documentNumber ? req.params.documentNumber.trim() : '';
    const etaDate = req.params.etaDate ? req.params.etaDate.trim() : '';

    const filter = {
        orderNumber: orderNumber,
        documentNumber: documentNumber
    };

    if (orderNumber === '' || documentNumber === '') {
        console.log(filter);
        res.status(500).json({ message: "Updating failed!", data: filter, error: error });
    }

    let set = {
        orderNumber: orderNumber,
        documentNumber: documentNumber,
        etaDate: new Date(etaDate),
        lastUpdateAt: new Date(),
        lastUpdateBy: req.userData.userId
    };

    SapCommitmentEta.findOneAndUpdate(filter, set, option)
      .then(result => {
        res.status(200).json({ message: "Updating successful!", data: result });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ message: "Updating failed!", data: result, error: error });
    });
};