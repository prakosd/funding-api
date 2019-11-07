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
      // const prA = await getTransactionsA(row.orderNumber);
      const transactions = await getTransactionsB(row.orderNumber)
      return {
        ...row,
        transactions: transactions
      };
  }));
  
  Promise.all(promises).then(result => {
    result.sort((a, b) => (a.orderNumber > b.orderNumber) ? 1 : -1);
    res.status(200).json({ message: "Fetching many successfully!", data: result });
  })
  
});

getTransactionsB = ash(async (orderNumber) => {
  const prs = await SapCommitmentController.getPrList(orderNumber);
  let pos = await SapCommitmentController.getPoList(orderNumber);
  let grs = await SapActualController.getGrList(orderNumber);

  const prSet = prs.reduce((accPr, pr) => {
    // set base PR value
    const prNumber = pr.prNumber;
    const name = pr.eas ? pr.eas.subject : pr.name;
    const prValue = pr.totalActual;
    const prPlan = pr.totalPlan;
    const requestor = pr.eas ? pr.eas.recipient : pr.username;
    const issueDate = pr.eas ? pr.eas.creationDate : pr.issueDate;
    const etaDate = pr.eas ? pr.eas.etaRequest : pr.etaDate;
    // find PO contains PR
    let fPos = pos.filter(x => x.prNumber === prNumber);
    if(fPos && fPos.length > 0) {
      const poSet = fPos.reduce((accPo, po) => {
        let fGrs = grs.filter(y => y.poNumber === po.poNumber);
        if(fGrs && fGrs.length > 0) {
          const grSet = fGrs.reduce((accGr, gr) => {
              accGr.push({
                prNumber: prNumber,
                poNumber: po.poNumber,
                grNumber: gr.grNumber,
                name: name,
                prValue: prValue,
                prPlan: prPlan,
                poValue: po.totalActual,
                poPlan: po.totalPlan,
                grValue: gr.totalActual,
                requestor: requestor,
                issueDate: issueDate,
                etaDate: etaDate,
                actualDate: gr.postingDate
              });
              return accGr
          }, []);
          grs = [...grs.filter(y => y.poNumber !== po.poNumber)];
          return accPo.concat(grSet);
        } else {
          accPo.push({
            prNumber: prNumber,
            poNumber: po.poNumber,
            grNumber: null,
            name: name,
            prValue: prValue,
            prPlan: prPlan,
            poValue: po.totalActual,
            poPlan: po.totalPlan,
            grValue: 0,
            requestor: requestor,
            issueDate: issueDate,
            etaDate: etaDate,
            actualDate: null
          });
          return accPo;
        }
      }, []);
      pos = [...pos.filter(x => x.prNumber !== prNumber)];
      return accPr.concat(poSet);
    } else {
      accPr.push({
        prNumber: prNumber,
        poNumber: null,
        grNumber: null,
        name: name,
        prValue: prValue,
        prPlan: prPlan,
        poValue: 0,
        poPlan: 0,
        grValue: 0,
        requestor: requestor,
        issueDate: issueDate,
        etaDate: etaDate,
        actualDate: null
      });
      return accPr;
    }
  }, []);

  const poReduced = pos.reduce((accPo, po) => {
    let fGrs = grs.filter(y => y.poNumber === po.poNumber);
    if(fGrs && fGrs.length > 0) {
      const grSet = fGrs.reduce((accGr, gr) => {
          accGr.push({
            prNumber: null,
            poNumber: po.poNumber,
            grNumber: gr.grNumber,
            name: po.name,
            prValue: 0,
            prPlan: 0,
            poValue: po.totalActual,
            poPlan: po.totalPlan,
            grValue: gr.totalActual,
            requestor: po.username,
            issueDate: po.issueDate,
            etaDate: po.etaDate,
            actualDate: gr.postingDate
          });
          return accGr
      }, []);
      grs = [...grs.filter(y => y.poNumber !== po.poNumber)];
      return accPo.concat(grSet);
    } else {
      accPo.push({
        prNumber: null,
        poNumber: po.poNumber,
        grNumber: null,
        name: po.name,
        prValue: 0,
        prPlan: 0,
        poValue: po.totalActual,
        poPlan: po.totalPlan,
        grValue: 0,
        requestor: po.username,
        issueDate: po.issueDate,
        etaDate: po.etaDate,
        actualDate: null
      });
      return accPo;
    }
  }, []);
  // PO need to reduce with the GR as Well

  const grMapped = grs.map(gr => {
    return {
      prNumber: null,
      poNumber: null,
      grNumber: gr.grNumber,
      name: gr.name,
      prValue: 0,
      prPlan: 0,
      poValue: 0,
      poPlan: 0,
      grValue: gr.totalActual,
      requestor: gr.username,
      issueDate: gr.issueDate,
      etaDate: null,
      actualDate: gr.postingDate
    }
  });
  // gr need to be mapped like the rest.
  //result.sort((a, b) => (a.orderNumber > b.orderNumber) ? 1 : -1);
  return Promise.all(prSet
    .concat(poReduced)
    .concat(grMapped)
    );
});

getTransactionsA = ash(async (orderNumber) => {
    // const result = {
    //   prList: await SapCommitmentController.getPrList(orderNumber),
    //   poList: await SapCommitmentController.getPoList(orderNumber),
    //   grList: await SapActualController.getGrList(orderNumber),
    // };
    // return result;

    return await SapCommitmentController.getPrList(orderNumber);
});

