const SapActual = require("../models/sap-actual");
const ash = require('express-async-handler')

exports.createOne = (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  let data = new SapActual({});
  
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

  SapActual.findByIdAndUpdate(id, set, option)
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
      referenceNumber: req.body.referenceNumber,
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

  SapActual.findOneAndUpdate(filter, set, option)
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
  SapActual.findByIdAndDelete(id).then(result => {
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

   SapActual.deleteMany(filter).then(result => {
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
  const referenceNumber = req.query.referenceNumber;
  const position = +req.query.position;

  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);

  // console.log(startDate, endDate);
  let query = SapActual.find();
  if (fields) { query.select(fields) }
  if (year) { query.where('postingDate').gte(startDate).lt(endDate) }
  if (orderNumber) {  query.where('orderNumber').equals(orderNumber); }
  if (referenceNumber) {  query.where('referenceNumber').equals(referenceNumber); }
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
  const referenceNumber = req.query.referenceNumber;
  const position = +req.query.position;

  let query;
  if (id) { query = SapActual.findById(id); }
  else { 
    query = SapActual.findOne();
    if (orderNumber) { query.where('orderNumber').equals(orderNumber); }
    if (referenceNumber) { query.where('referenceNumber').equals(referenceNumber); }
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
  const aggregate = SapActual.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: new RegExp(orderNumber) },
      { postingDate: { $gte: startDate, $lt: endDate } }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      category: 'PInv',
     },
     year: { $first: year },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: 0 }
  });
  aggregate.sort({ orderNumber: 1 });
  return aggregate;
};

exports.getGrList = ash(async (year, orderNumber) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);
  const aggregate = SapActual.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { orderNumber: orderNumber },
      { postingDate: { $gte: startDate, $lt: endDate } }
    ] 
  }); 

  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      purchasingNumber: { 
        $ifNull: ['$purchasingNumber', '$referenceNumber'] 
       }
     },
     items: { $addToSet: '$name' },
     headerTexts: { $addToSet: '$headerText' },
     remarks: { $addToSet: '$remark' },
     referenceNumber: { $first: '$referenceNumber' },
     totalActual: { $sum: '$actualValue' },
     documentDate: { $max: '$documentDate' },
     postingDate: { $max: '$postingDate' },
     username: { $first: '$username' },
     lastUpdateAt: { $max: '$lastUpdateAt' },
     lastUpdateBy: { $last: '$lastUpdateBy' }
  });
  aggregate.sort({ postingDate: -1, purchasingNumber: 1  });

  const result = await aggregate;
  const promises = result.map(ash(async (row) => {
    return {
      orderNumber: row._id.orderNumber,
      prNumber: null,
      poNumber: row._id.purchasingNumber,
      grNumber: row.referenceNumber,
      items: row.items,
      remarks: row.remarks,
      headerTexts: row.headerTexts,
      totalActual: row.totalActual,
      issueDate: row.documentDate,
      postingDate: row.postingDate,
      username: row.username,
      lastUpdateAt: row.lastUpdateAt,
      lastUpdateBy: row.lastUpdateBy
    };
  }));

  return Promise.all(promises);
});