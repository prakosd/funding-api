const SapCommitment = require("../models/sap-commitment");

exports.createOne = (req, res, next) => {
  console.log(req);
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
    lastUpdateAt: new Date(),
    lastUpdateBy: "prakosd"
  });
  sapCommitment
    .save()
    .then(savedSapCommitment => {
      res.status(201).json({
        message: "new SAP Commitment added successfully",
        id: savedSapCommitment._id
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Creating SAP Commitment is failed!",
        id: null
      });
    });
};

exports.updateOne = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false };
  const id = req.params.id;
  const set = {
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
      lastUpdateAt: new Date(),
      lastUpdateBy: "prakosd"
  };
  
  SapCommitment.findByIdAndUpdate(id, set, option)
    .then(result => {
      res.status(200).json({ message: "Update successful!", id: id });
      // if (result.n > 0) {
      //   res.status(200).json({ message: "Update successful!", id: id });
      // } else {
      //   res.status(401).json({ message: "Not authorized!", id: id });
      // }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Creating SAP Commitment is failed!",
        error: error,
        id: id
      });
    });
};

exports.setLink = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false };
  const id = req.params.id;
  const set = {
      isLinked: req.body.isLinked,
      lastUpdateAt: new Date(),
      lastUpdateBy: "prakosd"
  };
  
  SapCommitment.findByIdAndUpdate(id, set, option)
    .then(result => {
      res.status(200).json({ message: "Update successful!", id: id });
      // if (result.n > 0) {
      //   res.status(200).json({ message: "Update successful!", id: id });
      // } else {
      //   res.status(401).json({ message: "Not authorized!", id: id });
      // }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Creating SAP Commitment is failed!",
        error: error,
        id: id
      });
    });
};

exports.setLock = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false };
  const id = req.params.id;
  const set = {
      isLocked: req.body.isLocked,
      lastUpdateAt: new Date(),
      lastUpdateBy: "prakosd"
  };
  
  SapCommitment.findByIdAndUpdate(id, set, option)
    .then(result => {
      res.status(200).json({ message: "Update successful!", id: id });
      // if (result.n > 0) {
      //   res.status(200).json({ message: "Update successful!", id: id });
      // } else {
      //   res.status(401).json({ message: "Not authorized!", id: id });
      // }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Creating SAP Commitment is failed!",
        error: error,
        id: id
      });
    });
};

exports.deleteOne = (req, res, next) => {
  const id = req.params.id;
    SapCommitment.findByIdAndDelete(id).then(result => {
      res.status(200).json({ message: "Deletion successful!" });
        // if (result.n > 0) {
        //   res.status(200).json({ message: "Deletion successful!" });
        // } else {
        //   res.status(401).json({ message: "Not authorized!" });
        // }
    }).catch(error => {
      console.log(error);
      res.status(500).json({
          message: "Deleting posts failed!"
      });
    });
};

exports.deleteMany = (req, res, next) => {
    
};

exports.getMany = (req, res, next) => {
  let year = (new Date).getFullYear();
    if (req.query.year) {
      year = +req.query.year;
    }
    const startDate = new Date(year, 0, 2);
    const endDate = new Date(year+1, 0, 2);
  
    // console.log(startDate, endDate);
    const query = SapCommitment.find().where('debitDate')
    .gte(startDate).lt(endDate).sort('orderNumber category documentNumber ');
    query.then(sapCommitments => {
      res.status(200).json({
        message: "SAP Commitments fetched successfully!",
        sapCommitments: sapCommitments
      });
    }).catch(error => {
      console.log(error);
      res.status(500).json({
        message: "Fetching SAP Commitments failed!"
      });
    });    
};

exports.getOne = (req, res, next) => {
    SapCommitment.findById(req.params.id)
    .then(sapCommitment => {
        if (sapCommitment) {
            res.status(200).json({
              message: "SAP Commitments fetched successfully!",
              sapCommitment: sapCommitment
            });
          } else {
            res.status(404).json({ message: "SAP Commitment not found!" });
          }
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Fetching SAP Commitment failed!"
          });
    });
};

exports.insertOne = (req, res, next) => {
  //Upsert one-by-one  
};