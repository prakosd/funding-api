exports.getMany = (req, res, next) => {
    const result = [{
        orderNumber: 'CGMM2019V167',
        name: 'Start of Production V167',
        sumPr: 3000000,
        sumPo: 4000000,
        sumActual: 467499938949,
        prs: [],
        pos: [],
        actuals: []
    }];

    res.status(200).json({ message: "Fetching many successfully!", data: result });
  };

//   exports.getMany = (req, res, next) => {
//     const pageSize = +req.query.pagesize;
//     const currentPage = +req.query.page;
//     const fields = req.query.fields;
//     const sorts = req.query.sorts;
  
//     const requisitionNumber = req.query.requisitionNumber;
  
//     let year = (new Date).getFullYear();
//     if (req.query.year) {
//       year = +req.query.year;
//     }
//     const startDate = new Date(year, 0, 2);
//     const endDate = new Date(year+1, 0, 2);
  
//     // console.log(startDate, endDate);
//     let query = SapEas.find();
//     if (fields) { query.select(fields) }
//     if (year) { query.where('etaRequest').gte(startDate).lt(endDate) }
//     if (requisitionNumber) {  query.where('requisitionNumber').equals(requisitionNumber); }
//     if (sorts) { query.sort(sorts); }
//     if (pageSize && currentPage) { query.skip(pageSize * (currentPage - 1)).limit(pageSize); }
  
//     query.then(result => {
//       res.status(200).json({ message: "Fetching many successfully!", data: result });
//     }).catch(error => {
//       console.log(error);
//       res.status(500).json({ message: "Fetching many failed!" });
//     });    
//   };