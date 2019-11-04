const ash = require('express-async-handler')
const SapEasController = require("../controllers/sap-eas");
const SapCommitment = require("../models/sap-commitment");
const SapPrToPo = require("../models/sap-pr-to-po");

exports.createOne = (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  let data = new SapCommitment({});
  
  for (key in body) {
    if (body.hasOwnProperty(key)) {
      data[key] = body[key];
    }
  }
  data.lastUpdateAt = new Date();
  data.lastUpdateBy = req.userData.userId;

  data
    .save()
    .then(result => {
      res.status(201).json({ message: "Creating successful!", data: { _id: result._id }});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({message: "Creating failed!" });
    });
};

exports.patchOne = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: false, setDefaultsOnInsert: true };
  const id = req.params.id;
  const body = JSON.parse(JSON.stringify(req.body));
  let set = {};
  
  for (key in body) {
    if (body.hasOwnProperty(key)) {
      set[key] = body[key];
    }
  }
  set.lastUpdateAt = new Date();
  set.lastUpdateBy = req.userData.userId;

  SapCommitment.findByIdAndUpdate(id, set, option)
    .then(result => {
      res.status(200).json({ message: "Patching successful!", data: { _id: result._id } });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: "Patching failed!", data: { _id: id }, error: error });
    });
};

exports.upsertOne = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: true, setDefaultsOnInsert: true };
  const body = JSON.parse(JSON.stringify(req.body));
  const id = req.params.id;
  let filter;
  if (id) { filter = { _id: id }; }
  else {
    filter = {
      orderNumber: req.body.orderNumber,
      documentNumber: req.body.documentNumber,
      position: req.body.position,
    };
  }
  let set = {};
  
  for (key in body) {
    if (body.hasOwnProperty(key)) {
      set[key] = body[key];
    }
  }
  set['lastUpdateAt'] = new Date();
  set['lastUpdateBy'] = req.userData.userId;

  SapCommitment.findOneAndUpdate(filter, set, option)
    .then(result => {
      res.status(200).json({ message: "Updating successful!", data: { _id: result._id }});
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: "Updating failed!", data: { _id: id }, error: error });
    });
};

exports.deleteOne = (req, res, next) => {
  const id = req.params.id;
    SapCommitment.findByIdAndDelete(id).then(result => {
      res.status(200).json({ message: "Deleting one successful!", data: { _id: id }});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: "Deleting one failed!", data: { _id: id }, error: error });
    });
};

exports.deleteMany = (req, res, next) => {
   const filter = { $and:[
                    { $or: [ { isLocked: false }, { isLocked: { $exists: false } } ] },
                    { $or:[ { isImported: true }, { isImported: { $exists: false }}] }
                  ]};

   SapCommitment.deleteMany(filter).then(result => {
    res.status(200).json({ message: "Deleting many successful!" });
   }).catch(error => {
      console.log(error);
      res.status(500).json({ message: "Deleting many failed!" });
   });
};

exports.getMany = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const fields = req.query.fields;
  const sorts = req.query.sorts;

  const orderNumber = req.query.ordernumber;
  const documentNumber = req.query.documentnumber;
  const position = +req.query.position;

  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);

  // console.log(startDate, endDate);
  let query = SapCommitment.find();
  if (fields) { query.select(fields) }
  if (year) { query.where('debitDate').gte(startDate).lt(endDate) }
  if (orderNumber) {  query.where('orderNumber').equals(orderNumber); }
  if (documentNumber) {  query.where('documentNumber').equals(documentNumber); }
  if (position) {  query.where('position').equals(position); }
  if (sorts) { query.sort(sorts); }
  if (pageSize && currentPage) { query.skip(pageSize * (currentPage - 1)).limit(pageSize); }

  query.then(result => {
    res.status(200).json({ message: "Fetching many successfully!", data: result });
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: "Fetching many failed!" });
  });    
};

exports.getOne = (req, res, next) => {
  const id = req.params.id;
  const fields = req.query.fields;
  const sorts = req.query.sorts;

  const orderNumber = req.query.ordernumber;
  const documentNumber = req.query.documentnumber;
  const position = +req.query.position;

  let query;
  if (id) { query = SapCommitment.findById(id); }
  else { 
    query = SapCommitment.findOne();
    if (orderNumber) { query.where('orderNumber').equals(orderNumber); }
    if (documentNumber) { query.where('documentNumber').equals(documentNumber); }
    if (position) { query.where('position').equals(position); }
  }
  if (fields) { query.select(fields) }
  if (sorts) { query.sort(sorts); }

  query.then(result => {
      if (result) {
          res.status(200).json({
            message: "Fetching one successfully!", data: result });
        } else {
          res.status(404).json({ message: "Data not found" });
        }
  }).catch(error => {
      console.log(error);
      res.status(500).json({ message: "Fetching one successfully!" });
  });
};

exports.getSapCommitmentTotal = (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);
  const aggregate = SapCommitment.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { debitDate: { $gte: startDate, $lt: endDate } }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      category: '$category',
     },
     year: { $first: year },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' }
  });
  return aggregate;
};

exports.getPrList = ash(async (orderNumber) => {
  const aggregate = SapCommitment.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: orderNumber },
      { category: 'PReq' }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      documentNumber: '$documentNumber'
     },
     name: { $first: '$name' },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' },
     documentDate: { $max: '$documentDate' },
     debitDate: { $max: '$debitDate' }
  });

  const result = await aggregate;
  const promises = result.map(ash(async (row) => {
    const eas = await SapEasController.getEasDetail(row._id.documentNumber);
    
    return {
      orderNumber: row._id.orderNumber,
      prNumber: row._id.documentNumber,
      eas : eas,
      name: row.name,
      totalActual: row.totalActual,
      totalPlan: row.totalPlan,
      issueDate: row.documentDate,
      etaDate: row.debitDate      
    };
  }));

  return Promise.all(promises);
});

exports.getPoList = ash(async (orderNumber) => {
  const aggregate = SapCommitment.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: orderNumber },
      { category: 'POrd' }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      documentNumber: '$documentNumber'
     },
     name: { $first: '$name' },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' },
     documentDate: { $max: '$documentDate' },
     debitDate: { $max: '$debitDate' }
  });

  const result = await aggregate;
  const promises = result.map(ash(async (row) => {
    const pr = await getPrNumber(row._id.orderNumber, row._id.documentNumber);
    return {
      orderNumber: row._id.orderNumber,
      poNumber: row._id.documentNumber,
      prNumber: pr ? pr.prNumber : null,
      name: row.name,
      totalActual: row.totalActual,
      totalPlan: row.totalPlan,
      issueDate: row.documentDate,
      etaDate: row.debitDate      
    };
  }));

  return Promise.all(promises);
});

getPrNumber = (orderNumber, poNumber) => {
  return SapPrToPo.findOne()
    .where('orderNumber').equals(orderNumber)
    .where('poNumber').equals(poNumber)
    .select('prNumber');
};