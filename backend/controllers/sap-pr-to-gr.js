const SapPrToGr = require("../models/sap-pr-to-gr");

exports.getPrNumber = (orderNumber, grNumber) => {
    return SapPrToGr.findOne()
        .where('orderNumber').equals(orderNumber)
        .where('grNumber').equals(grNumber)
        .select('prNumber');
};

exports.getMany = (req, res, next) => {
    const orderNumber = req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const prNumber = req.params.prNumber ? req.params.prNumber.trim() : '';
    const grNumber = req.params.grNumber ? req.params.grNumber.trim() : '';

    let query = SapPrToGr.find();
    if (orderNumber !== '' && orderNumber !== 'ordernumbers') { query.where('orderNumber').equals(orderNumber); }
    if (prNumber !== '' && prNumber !== 'prs') { query.where('prNumber').equals(prNumber); }
    if (grNumber !== '' && grNumber !== 'pos') { query.where('grNumber').equals(grNumber); }

    query.sort('orderNumber prNumber grNumber');

    query.then(result => {
        res.status(200).json({ message: "Fetching many successfully!", data: result });
    })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: "Fetching many failed!" });
        });
};

exports.deleteOne = (req, res, next) => {
    const orderNumber = req.params.orderNumber ? req.params.orderNumber.trim() : '';
    const grNumber = req.params.grNumber ? req.params.grNumber.trim() : '';

    const filter = {
        orderNumber: orderNumber,
        grNumber: grNumber
    };
    
    SapPrToGr.deleteMany(filter).then(result => {
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
    const grNumber = req.params.grNumber ? req.params.grNumber.trim() : '';

    const filter = {
        orderNumber: orderNumber,
        prNumber: prNumber,
        grNumber: grNumber
    };

    if (orderNumber === '' || prNumber === '' || grNumber === '') {
        console.log(filter);
        res.status(500).json({ message: "Updating failed!", data: filter, error: error });
    }

    let set = {
        orderNumber: orderNumber,
        prNumber: prNumber,
        grNumber: grNumber
    };

    SapPrToGr.findOneAndUpdate(filter, set, option)
        .then(result => {
            res.status(200).json({ message: "Updating successful!", data: result });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: "Updating failed!", data: result, error: error });
        });
};