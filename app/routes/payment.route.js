module.exports = app => {
    const payment = require("../controllers/payment.controller");
    const { checktoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    

    // Routes
    router.get("/invoices/toc/:TOC/agentid/:AgentID/:IsPaid", checktoken, payment.getInvoiceList)

    router.get("/invoicescount/toc/:TOC/agentid/:AgentID", checktoken, payment.CountInvoiceList)
    router.post("/invoices",checktoken,payment.InvoiceMidtrans)

    // router.get("/validsig", checktoken, payment.validatePaymentSignature)

     router.post("/test", payment.testmethod)

    router.post("/handle",payment.handleAfterPayment)

    router.post("/totalproductionlist/agentid/:AgentID",checktoken,payment.TotalProductionList)
    router.post("/totalproductionsummary/agentid/:AgentID",checktoken,payment.TotalProductionSummary)

    router.get("/getinvoices/toc/:productid/quotationid/:quotationid/amount/:amount",checktoken,payment.InvoiceMidtrans)
    router.get("/collectionstatus/toc/:TOC/agentid/:AgentID/month/:Month/year/:Year",checktoken,payment.CollectionStatus)

    //Prefix
    app.use("/payment", router);
}