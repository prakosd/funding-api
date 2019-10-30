const SapEas = require("../models/sap-eas");

exports.createOne = (req, res, next) => {
  const body = JSON.parse(JSON.stringify(req.body));
  let data = new SapEas({});
  
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
  const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: false };
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

  SapEas.findByIdAndUpdate(id, set, option)
    .then(result => {
      res.status(200).json({ message: "Patching successful!", data: { _id: result._id } });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ message: "Patching failed!", data: { _id: id }, error: error });
    });
};

exports.upsertOne = (req, res, next) => {
  const option = { runValidators: true, context: 'query', useFindAndModify: false, new: true, upsert: true };
  const body = JSON.parse(JSON.stringify(req.body));
  const id = req.params.id;
  let filter;
  if (id) { filter = { _id: id }; }
  else {
    filter = {
      requisitionNumber: req.body.requisitionNumber
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

  SapEas.findOneAndUpdate(filter, set, option)
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
  SapEas.findByIdAndDelete(id).then(result => {
      res.status(200).json({ message: "Deleting one successful!", data: { _id: id }});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: "Deleting one failed!", data: { _id: id }, error: error });
    });
};

exports.deleteMany = (req, res, next) => {
   const filter = { $or: [{ isLocked: false }, { isLocked: { $exists: false } } ] };
   SapEas.deleteMany(filter).then(result => {
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

  const requisitionNumber = req.query.requisitionNumber;

  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }
  const startDate = new Date(year, 0, 1).toLocaleString();
  const endDate = new Date(year+1, 0, 1).toLocaleString();

  // console.log(startDate, endDate);
  let query = SapEas.find();
  if (fields) { query.select(fields) }
  if (year) { query.where('etaRequest').gte(startDate).lt(endDate) }
  if (requisitionNumber) {  query.where('requisitionNumber').equals(requisitionNumber); }
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

  const requisitionNumber = req.query.requisitionNumber;

  let query;
  if (id) { query = SapEas.findById(id); }
  else { 
    query = SapEas.findOne();
    if (requisitionNumber) { query.where('requisitionNumber').equals(requisitionNumber); }
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