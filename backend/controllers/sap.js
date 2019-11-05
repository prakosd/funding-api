const ash = require('express-async-handler')
const SapCommitmentController = require("../controllers/sap-commitments");
const SapActualController = require("../controllers/sap-actuals");


exports.getMany = ash(async (req, res, next) => {
  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }

  const sapCommitmentTotal = await SapCommitmentController.getTotal(year);
  const sapActualTotal = await SapActualController.getTotal(year);
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
      const prA = await getTransactionsA(row.orderNumber);
      const prB = await getTransactionsB(row.orderNumber)
      if(prA.length !== prB.length) {
        return {
          ...row,
          transactionsA: prA,
          transactionsB: prB
        };
      }
      
  }));
  Promise.all(promises).then(result => {
    res.status(200).json({ message: "Fetching many successfully!", data: result });
  })
  
});

getTransactionsB = ash(async (orderNumber) => {
  const prs = await SapCommitmentController.getPrList(orderNumber);
  const pos = await SapCommitmentController.getPoList(orderNumber);
  const grs = await SapActualController.getGrList(orderNumber);

  const prSet = prs.reduce((accPr, pr) => {
    // set base PR value
    const prNumber = pr.prNumber;
    const name = pr.eas ? pr.eas.subject : pr.name;
    const prValue = pr.totalActual;
    const requestor = pr.eas ? pr.eas.recipient : pr.username;
    const issueDate = pr.eas ? pr.eas.creationDate : pr.issueDate;
    const etaDate = pr.eas ? pr.eas.etaRequest : pr.etaDate;
    // find PO contains PR
    fPos = pos.filter(x => x.prNumber === prNumber);
    if(fPos && fPos.length > 0) {
      return fPos.reduce((accPo, po) => {
        fGrs = grs.filter(y => y.poNumber === po.poNumber);
        if(fGrs && fGrs.length > 0) {
         return fGrs.reduce((accGr, gr) => {
              accGr.push({
                prNumber: prNumber,
                poNumber: po.poNumber,
                grNumber: gr.grNumber,
                name: name,
                prValue: prValue,
                poValue: po.totalActual,
                grValue: gr.totalActual,
                requestor: requestor,
                issueDate: issueDate,
                etaDate: etaDate,
                actualDate: gr.postingDate
              });
              return accGr
          }, []);
        } else {
          accPo.push({
            prNumber: prNumber,
            poNumber: po.poNumber,
            grNumber: '',
            name: name,
            prValue: prValue,
            poValue: po.totalActual,
            grValue: 0,
            requestor: requestor,
            issueDate: issueDate,
            etaDate: etaDate,
            actualDate: null
          });
          return accPo;
        }
      }, []);
    } else {
      accPr.push({
        prNumber: prNumber,
        poNumber: '',
        grNumber: '',
        name: name,
        prValue: prValue,
        poValue: 0,
        grValue: 0,
        requestor: requestor,
        issueDate: issueDate,
        etaDate: etaDate,
        actualDate: null
      });
      return accPr;
    }
  }, []);

  return Promise.all(prSet);
});

getTransactionsA = ash(async (orderNumber) => {
    // const result = {
    //   prList: await SapCommitmentController.getPrList(orderNumber),
    //   poList: await SapCommitmentController.getPoList(orderNumber),
    //   grList: await SapActualController.getGrList(orderNumber),
    // };
    // return result;

    return  await SapCommitmentController.getPrList(orderNumber);
});

