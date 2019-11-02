const SapCommitment = require("../models/sap-commitment");
const SapActual = require("../models/sap-actual");

exports.getMany = (req, res, next) => {
  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }

  let sapCommitments;
  let sapActuals;
  getSapCommitments(year).then(result => {
    sapCommitments = result;
    let finalResult = [];
    getSapActuals(year).then(result => {
      sapActuals = result;
      const sap = [...sapCommitments, ...sapActuals].map(row => {
        return {
          orderNumber: row._id.orderNumber,
          category: row._id.category,
          totalActual: row.totalActual,
          totalPlan: row.totalPlan
        };
      });
      
      // .forEach((row, index, array) => {
      //  finalResult.push(row);
        // if(!finalResult) {
        //   finalResult.push(row);
        // } else {
        //   let find = finalResult.filter(d => d.orderNumber === row.orderNumber && d.category === row.category)
        //   if(find) {
        //     find.totalActual += row.totalActual;
        //     find.totalPlan += row.totalPlan;
        //   } else {
        //     finalResult.push(row);
        //   }
        // }
      res.status(200).json({ message: "Fetching many successfully!", data: sap });
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: "Fetching many failed!" });
    });
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: "Fetching many failed!" });
  });    
};

getSapCommitments = (year) => {
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
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' }
  });

  return aggregate;
}

getSapActuals = (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year+1, 0, 1);

  const aggregate = SapActual.aggregate();
  aggregate.match({
    $and: [
      { isLinked: true },
      { postingDate: { $gte: startDate, $lt: endDate } }
    ] 
  }); 
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      category: 'PInv',
     },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: 0 }
  });

  return aggregate;
}

getTransactions = (orderNumber) => {
  const result = [
    {
      pr: '210002125',
      po: '450002154',
      gr: '111215422',
      namePr: 'Shower Test',
      nameEas: 'Shower Test',
      prValue: 0,
      poValue: 0,
      grValue: 0,
      issuer: 'Yulia Marhawati',
      issueDate: '2019-1-19',
      etaDate: '2019-2-19',
      grDate: '2019-2-19'
    },
    {
      pr: '210007875',
      po: '450988154',
      gr: '111225422',
      namePr: 'Engraving Machine',
      nameEas: 'Engraving Engraving',
      prValue: 0,
      poValue: 0,
      grValue: 0,
      issuer: 'Yulia Marhawati',
      issueDate: '2019-1-19',
      etaDate: '2019-2-19',
      grDate: '2019-2-19'
    }
  ];

  return result;
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