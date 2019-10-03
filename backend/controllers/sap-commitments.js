const SapCommitment = require("../models/sap-commitment");

exports.createOne = (req, res, next) => {
  const sapCommitment = new SapCommitment({
    orderNumber: req.body.orderNumber,
    category: req.body.category,
    documentNumber: req.body.documentNumber,
    position: req.body.position,
    costElement: req.body.costElement,
    name: req.body.name,
    quantity: req.body.quantity,
    uom: req.body.uom,
    currency: req.body.currency,
    actualValue: req.body.actualValue,
    planValue: req.body.planValue,
    documentDate: req.body.documentDate,
    debitDate: req.body.debitDate,
    username: req.body.username,
    isLocked: req.body.isLocked,
    isLinked: req.body.isLinked,
    remark: req.body.remark,
    lastUpdateAt: new Date(),
    lastUpdateBy: req.userData.userId
  });
  sapCommitment
    .save()
    .then(result => {
      res.status(201).json({
        message: "Creating successful!",
        id: result._id
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Creating failed!",
        id: null
      });
    });
};

exports.patchOne = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: false };
  const id = req.params.id;
  const body = JSON.parse(JSON.stringify(req.body));
  let set = {};
  
  for (key in body) {
    if (body.hasOwnProperty(key)) {
      set[key] = body[key];
    }
  }
  set['lastUpdateAt'] = new Date();
  set['lastUpdateBy'] = req.userData.userId;

  SapCommitment.findByIdAndUpdate(id, set, option)
    .then(result => {
      res.status(200).json({ message: "Patching successful!", id: result._id });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Patching failed!",
        id: id,
        error: error
      });
    });
};

exports.updateOne = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: true };
  const filter = {
    orderNumber: req.body.orderNumber,
    documentNumber: req.body.documentNumber,
    position: req.body.position,
  };
  let set = {
    orderNumber: req.body.orderNumber,
    category: req.body.category,
    documentNumber: req.body.documentNumber,
    position: req.body.position,
    costElement: req.body.costElement,
    name: req.body.name,
    quantity: req.body.quantity,
    uom: req.body.uom,
    currency: req.body.currency,
    actualValue: req.body.actualValue,
    planValue: req.body.planValue,
    documentDate: req.body.documentDate,
    debitDate: req.body.debitDate,
    username: req.body.username,
    isLocked: req.body.isLocked,
    isLinked: req.body.isLinked,
    remark: req.body.remark,
    lastUpdateAt: new Date(),
    lastUpdateBy: req.userData.userId
  };
  SapCommitment.findOneAndUpdate(filter, set, option)
    .then(result => {
      res.status(200).json({ message: "Updating successful!", data: result });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Updating failed!",
        id: id,
        error: error
      });
    });
};

exports.deleteOne = (req, res, next) => {
  const id = req.params.id;
    SapCommitment.findByIdAndDelete(id).then(result => {
      res.status(200).json({ message: "Deleting one successful!", id: id });
    }).catch(error => {
      console.log(error);
      res.status(500).json({
          message: "Deleting one failed!",
          id: id,
          error: error
      });
    });
};

exports.deleteMany = (req, res, next) => {
   const filter = { isLocked: false };
   SapCommitment.deleteMany(filter).then(result => {
    res.status(200).json({ message: "Deleting many successful!" });
   }).catch(error => {
      console.log(error);
      res.status(500).json({
          message: "Deleting many failed!"
      });
   });
};

exports.getMany = (req, res, next) => {
  const orderNumber = req.query.ordernumber;
  const fields = req.query.fields;
  const sorts = req.query.sorts;
  const documentNumber = req.query.documentnumber;
  const position = +req.query.position;

  let year = (new Date).getFullYear();
    if (req.query.year) {
      year = +req.query.year;
    }
    const startDate = new Date(year, 0, 2);
    const endDate = new Date(year+1, 0, 2);
  
    // console.log(startDate, endDate);
    let query = SapCommitment.find();
    if (fields) { query = query.select(fields) }
    if (year) { query = query.where('debitDate').gte(startDate).lt(endDate) }
    if (orderNumber) {  query = query.where('orderNumber').equals(orderNumber); }
    if (documentNumber) {  query = query.where('documentNumber').equals(documentNumber); }
    if (position) {  query = query.where('position').equals(position); }
    if (sorts) { query = query.sort(sorts); }

    query.then(sapCommitments => {
      res.status(200).json({
        message: "Fetching many successfully!",
        sapCommitments: sapCommitments
      });
    }).catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Fetching many failed!"
      });
    });    
};

exports.getOne = (req, res, next) => {
  const id = req.params.id;
  const fields = req.query.fields;
  const orderNumber = req.query.ordernumber;
  const documentNumber = req.query.documentnumber;
  const position = +req.query.position;

  let query;
  if (id) { query = SapCommitment.findById(id); } else { query = SapCommitment.findOne(); }
  if (fields) { query = query.select(fields) }
  if (orderNumber) {  query = query.where('orderNumber').equals(orderNumber); }
  if (documentNumber) {  query = query.where('documentNumber').equals(documentNumber); }
  if (position) {  query = query.where('position').equals(position); }

  query.then(sapCommitment => {
      if (sapCommitment) {
          res.status(200).json({
            message: "Fetching one successfully!",
            data: sapCommitment
          });
        } else {
          res.status(404).json({ message: "Data not found" });
        }
  }).catch(error => {
      console.log(error);
      res.status(500).json({
          message: "Fetching one successfully!"
        });
  });
};