const ash = require('express-async-handler')
const SapCommitmentController = require("../controllers/sap-commitments");
const SapActualController = require("../controllers/sap-actuals");


exports.getManyV1 = ash(async (req, res, next) => {
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
      const transactions = await getTransactions(row.orderNumber, year)
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

exports.getManyV2 = ash(async (req, res, next) => {
  let year = (new Date).getFullYear();
  if (req.query.year) {
    year = +req.query.year;
  }

});



getTransactions = ash(async (orderNumber, year) => {
  const prs = await SapCommitmentController.getPrList(orderNumber, year);
  let pos = await SapCommitmentController.getPoList(orderNumber, year);
  let grs = await SapActualController.getGrList(orderNumber, year);

  const prSet = prs.reduce((accPr, pr) => {
    // set base PR value
    const prNumber = pr.prNumber;
    const subject = pr.eas ? pr.eas.subject : pr.items.reduce(function (a, b) { return a.length > b.length ? a : b; }, []);
    const items = pr.items;
    const prValue = pr.totalActual;
    const prPlan = pr.totalPlan;
    const requestor = pr.eas ? pr.eas.recipient : pr.username;
    const issueDate = pr.eas ? pr.eas.creationDate : pr.issueDate;
    const etaDate = pr.eas ? pr.eas.etaRequest : pr.etaDate;
    const lastUpdateAt = pr.lastUpdateAt;
    const lastUpdateBy = pr.lastUpdateBy;
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
                subject: subject,
                items: po.items,
                prValue: prValue,
                prPlan: prPlan,
                poValue: po.totalActual,
                poPlan: po.totalPlan,
                grValue: gr.totalActual,
                requestor: requestor,
                issueDate: issueDate,
                etaDate: etaDate,
                actualDate: gr.postingDate,
                lastUpdateAt: gr.lastUpdateAt,
                lastUpdateBy: gr.lastUpdateBy
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
            subject: subject,
            items: po.items,
            prValue: prValue,
            prPlan: prPlan,
            poValue: po.totalActual,
            poPlan: po.totalPlan,
            grValue: 0,
            requestor: requestor,
            issueDate: issueDate,
            etaDate: etaDate,
            actualDate: null,
            lastUpdateAt: po.lastUpdateAt,
            lastUpdateBy: po.lastUpdateBy
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
        subject: subject,
        items: items,
        prValue: prValue,
        prPlan: prPlan,
        poValue: 0,
        poPlan: 0,
        grValue: 0,
        requestor: requestor,
        issueDate: issueDate,
        etaDate: etaDate,
        actualDate: null,
        lastUpdateAt: lastUpdateAt,
        lastUpdateBy: lastUpdateBy
      });
      return accPr;
    }
  }, []);

  const poReduced = pos.reduce((accPo, po) => {
    const subject = po.items.reduce(function (a, b) { return a.length > b.length ? a : b; }, []);
    let fGrs = grs.filter(y => y.poNumber === po.poNumber);
    if(fGrs && fGrs.length > 0) {
      const grSet = fGrs.reduce((accGr, gr) => {
          accGr.push({
            prNumber: null,
            poNumber: po.poNumber,
            grNumber: gr.grNumber,
            subject: subject,
            items: po.items,
            prValue: 0,
            prPlan: 0,
            poValue: po.totalActual,
            poPlan: po.totalPlan,
            grValue: gr.totalActual,
            requestor: po.username,
            issueDate: po.issueDate,
            etaDate: po.etaDate,
            actualDate: gr.postingDate,
            lastUpdateAt: gr.lastUpdateAt,
            lastUpdateBy: gr.lastUpdateBy
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
        subject: subject,
        items: po.items,
        prValue: 0,
        prPlan: 0,
        poValue: po.totalActual,
        poPlan: po.totalPlan,
        grValue: 0,
        requestor: po.username,
        issueDate: po.issueDate,
        etaDate: po.etaDate,
        actualDate: null,
        lastUpdateAt: po.lastUpdateAt,
        lastUpdateBy: po.lastUpdateBy
      });
      return accPo;
    }
  }, []);
  // PO need to reduce with the GR as Well

  const grMapped = grs.map(gr => {
    return {
      prNumber: null,
      poNumber: gr.poNumber,
      grNumber: gr.grNumber,
      subject: gr.items.reduce(function (a, b) { return a.length > b.length ? a : b; }, []),
      items: gr.items,
      prValue: 0,
      prPlan: 0,
      poValue: 0,
      poPlan: 0,
      grValue: gr.totalActual,
      requestor: gr.username,
      issueDate: gr.issueDate,
      etaDate: null,
      actualDate: gr.postingDate,
      lastUpdateAt: gr.lastUpdateAt,
      lastUpdateBy: gr.lastUpdateBy
    }
  });
  // gr need to be mapped like the rest.
  //result.sort((a, b) => (a.orderNumber > b.orderNumber) ? 1 : -1);
  return Promise.all(prSet
    .concat(poReduced)
    .concat(grMapped)
    );
});

// getTransactionsA = ash(async (orderNumber) => {
//     // const result = {
//     //   prList: await SapCommitmentController.getPrList(orderNumber),
//     //   poList: await SapCommitmentController.getPoList(orderNumber),
//     //   grList: await SapActualController.getGrList(orderNumber),
//     // };
//     // return result;

//     return await SapCommitmentController.getPrList(orderNumber);
// });

