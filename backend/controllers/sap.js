const SapCommitment = require("../models/sap-commitment");

exports.getMany = (req, res, next) => {
    const result = getOrderNumbers(2019);
    if (result) {
      res.status(200).json({ message: "Fetching many successfully!", data: result });
    } else {
      res.status(500).json({ message: "Fetching many failed!" });
    }
    
  };

  exports.getOne = (req, res, next) => {
    const result = getTransactions('CGMM2019V167');
    res.status(200).json({ message: "Fetching one successfully!", data: result });
  };

getOrderNumbers = (year) => {
  const startDate = new Date(year, 0, 1).toLocaleString();
  const endDate = new Date(year+1, 0, 1).toLocaleString();

  const aggregate = SapCommitment.aggregate();
  aggregate.match({  isLinked: true });
  aggregate.group({ 
    _id: {
      orderNumber: '$orderNumber',
      category: '$category'
     },
     totalActual: { $sum: '$actualValue' },
     totalPlan: { $sum: '$planValue' }
  });

  aggregate.then(result => {
    console.log(result);
    return result;
  }).catch(error => {
    console.log(error);
    return;
  });
  
  // const result = [{
  //       orderNumber: 'CGMM2019V167',
  //       name: 'Start of Production V167',
  //       sumPr: 3000000,
  //       sumPo: 4000000,
  //       sumActual: 467499938949,
  //       transactions: getTransactions('CGMM2019V167')
  //     },
  //     {
  //       orderNumber: 'CGMM2019X167',
  //       name: 'Start of Production X167',
  //       sumPr: 787888,
  //       sumPo: 9855445,
  //       sumActual: 467499938949,
  //       transactions: getTransactions('CGMM2019V167')
  //     }
  //   ];
  //   return result;
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