const ash = require('express-async-handler')
const SapCommitmentController = require("../controllers/sap-commitments");
const SapActualController = require("../controllers/sap-actuals");


exports.getMany = ash(async (req, res, next) => {
  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }

  const sapCommitmentTotal = await SapCommitmentController.getSapCommitmentTotal(year);
  const sapActualTotal = await SapActualController.getSapActualTotal(year);
  const promises = [...sapCommitmentTotal, ...sapActualTotal].map(row => {
    return {
      year: row.year,
      orderNumber: row._id.orderNumber,
      category: row._id.category,
      totalActual: row.totalActual,
      totalPlan: row.totalPlan
    };
  }).reduce((acc, row) => {
    const findIndex = acc.findIndex(d => d.orderNumber === row.orderNumber);
    if(findIndex < 0) {
      const newValue = {
        year: row.year,
        orderNumber: row.orderNumber,
        totalPrActual: row.category === 'PReq' ? row.totalActual : 0,
        totalPrPlan: row.category === 'PReq' ? row.totalPlan : 0,
        totalPoActual: row.category === 'POrd' ? row.totalActual : 0,
        totalPoPlan: row.category === 'POrd' ? row.totalPlan : 0,
        totalGrActual: row.category === 'PInv' ? row.totalActual : 0
      };
      acc.push(newValue);
    } else {
      oldValue = acc[findIndex];
      const newValue = {
        year: oldValue.year,
        orderNumber: oldValue.orderNumber,
        totalPrActual: oldValue.totalPrActual + (row.category === 'PReq' ? row.totalActual : 0),
        totalPrPlan: oldValue.totalPrPlan + (row.category === 'PReq' ? row.totalPlan : 0),
        totalPoActual:  oldValue.totalPoActual + (row.category === 'POrd' ? row.totalActual : 0),
        totalPoPlan:  oldValue.totalPoPlan + (row.category === 'POrd' ? row.totalPlan : 0),
        totalGrActual:  oldValue.totalGrActual + (row.category === 'PInv' ? row.totalActual : 0)
      };
      acc[findIndex] = newValue;
    }
    return acc;
  }, []).map(ash(async (row) => {
      return {
        ...row,
        transactionsA: await getTransactionsA(row.orderNumber),
        transactionsB: await getTransactionsB(row.orderNumber)
      };
  }));
  Promise.all(promises).then(result => {
    res.status(200).json({ message: "Fetching many successfully!", data: result });
  })
  
});

getTransactionsB = ash(async (orderNumber) => {
  const prList = await SapCommitmentController.getPrList(orderNumber);
  const poList = await SapCommitmentController.getPoList(orderNumber);
  const grList = await SapActualController.getGrList(orderNumber);

  const transactions = prList.reduce((acc, pr) => {
    // set base PR value
    const prNumber = pr.prNumber;
    let poNumber;
    let grNumber;
    const name = pr.eas ? pr.eas.subject : pr.name;
    const prValue = pr.totalActual;
    let poValue;
    let grValue;
    const requestor = pr.eas ? pr.eas.recipient : pr.username;
    const issueDate = pr.eas ? pr.eas.creationDate : pr.issueDate;
    const etaDate = pr.eas ? pr.eas.etaRequest : pr.etaDate;
    let actualDate;
    // find PO contains PR
    filteredPoList = poList.filter(po => po.prNumber === prNumber);
    const result = filteredPoList.map(po => {
      filteredGrList = grList.filter(gr => gr.poNumber === po.poNumber);
      return filteredGrList.map(gr => {

      });
    });
  }, []);
  // const transactions = prList.reduce((acc, row) => {
  //   const prNumber = row.prNumber;
  //   let poList = [{ poNumber: 'dddd', totalValue: 1000 },];
  //   let grNumber;
  //   const name = row.eas ? row.eas.subject : row.name;
  //   const prValue = row.totalActual;
  //   let poValue;
  //   let grValue;
  //   const requestor = row.eas ? row.eas.recipient : row.username;
  //   const issueDate = row.eas ? row.eas.creationDate : row.issueDate;
  //   const etaDate = row.eas ? row.eas.etaRequest : row.etaDate;
  //   let actualDate;

  //   const result = {
  //     prNumber: row.prNumber
  //   }
  // }, []);

  return Promise.all(grList);
});

getTransactionsA = ash(async (orderNumber) => {
    const result = {
      prList: await SapCommitmentController.getPrList(orderNumber),
      poList: await SapCommitmentController.getPoList(orderNumber),
      grList: await SapActualController.getGrList(orderNumber),
    };
    return result;
});

