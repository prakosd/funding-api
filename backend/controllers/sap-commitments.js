const ash = require('express-async-handler')
const SapEasController = require("../controllers/sap-eas");
const SapCommitment = require("../models/sap-commitment");
const SapPrToPoController = require("../controllers/sap-pr-to-po");

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

exports.getTotal = (year, orderNumber) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);
  const aggregate = SapCommitment.aggregate();
  
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: new RegExp(orderNumber) },  
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
  aggregate.sort({ orderNumber: 1 });
  return aggregate;
};

exports.getPrList = ash(async (year, orderNumber) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);
  const aggregate = SapCommitment.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: orderNumber },
      { category: 'PReq' },
      { debitDate: { $gte: startDate, $lt: endDate } }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      documentNumber: '$documentNumber'
     },
     items: { $addToSet: '$name' },
     remarks: { $addToSet: '$remark' },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' },
     documentDate: { $max: '$documentDate' },
     debitDate: { $max: '$debitDate' },
     username: { $first: '$username' },
     lastUpdateAt: { $max: '$lastUpdateAt' },
     lastUpdateBy: { $last: '$lastUpdateBy' }
  });
  aggregate.sort({ documentDate: -1, documentNumber: 1  });

  const result = await aggregate;
  const promises = result.map(ash(async (row) => {
    const eas = await SapEasController.getDetail(row._id.documentNumber);
    
    return {
      orderNumber: row._id.orderNumber,
      prNumber: row._id.documentNumber,
      poNumber: null,
      grNumber: null,
      eas : eas,
      items: row.items,
      remarks: row.remarks,
      totalActual: row.totalActual,
      totalPlan: row.totalPlan,
      issueDate: row.documentDate,
      etaDate: row.debitDate,
      username: row.username,
      lastUpdateAt: row.lastUpdateAt,
      lastUpdateBy: row.lastUpdateBy
    };
  }));

  return Promise.all(promises);
});

exports.getPoList = ash(async (year, orderNumber) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);
  const aggregate = SapCommitment.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: orderNumber },
      { category: 'POrd' },
      { debitDate: { $gte: startDate, $lt: endDate } }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      documentNumber: '$documentNumber'
     },
     items: { $addToSet: '$name' },
     remarks: { $addToSet: '$remark' },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' },
     documentDate: { $max: '$documentDate' },
     debitDate: { $max: '$debitDate' },
     username: { $first: '$username' },
     lastUpdateAt: { $max: '$lastUpdateAt' },
     lastUpdateBy: { $last: '$lastUpdateBy' }
  });
  aggregate.sort({ documentDate: -1, documentNumber: 1  });
  
  const result = await aggregate;
  const promises = result.map(ash(async (row) => {
    const pr = await SapPrToPoController.getPrNumber(row._id.orderNumber, row._id.documentNumber);
    return {
      orderNumber: row._id.orderNumber,
      prNumber: pr ? pr.prNumber : null,
      poNumber: row._id.documentNumber,
      grNumber: null,
      items: row.items,
      remarks: row.remarks,
      totalActual: row.totalActual,
      totalPlan: row.totalPlan,
      issueDate: row.documentDate,
      etaDate: row.debitDate,
      username: row.username,
      lastUpdateAt: row.lastUpdateAt,
      lastUpdateBy: row.lastUpdateBy
    };
  }));

  return Promise.all(promises);
});

