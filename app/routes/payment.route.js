module.exports = app => {
    const payment = require("../controllers/payment.controller");
    const { checktoken, validatetoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    

    // Routes
    router.get("/invoices/toc/:TOC/agentid/:AgentID/:IsPaid", validatetoken, payment.getInvoiceList)

    router.get("/invoicescount/toc/:TOC/agentid/:AgentID", validatetoken, payment.CountInvoiceList)
    router.post("/invoices",validatetoken,payment.InvoiceMidtrans)
    router.get("/checkinvoices/:order_id",payment.findDetailInvoicesByOrderID)

    // router.get("/validsig", checktoken, payment.validatePaymentSignature)

     router.post("/test", payment.testmethod)

    router.post("/handle",payment.handleAfterPayment)

    router.post("/totalproductionlist/agentid/:AgentID",validatetoken,payment.TotalProductionList)
    router.post("/totalproductionsummary/agentid/:AgentID",validatetoken,payment.TotalProductionSummary)

    router.get("/getinvoices/toc/:productid/quotationid/:quotationid/amount/:amount",validatetoken,payment.InvoiceMidtrans)
    router.get("/collectionstatus/toc/:TOC/agentid/:AgentID/month/:Month/year/:Year",validatetoken,payment.CollectionStatus)

    //Prefix
    app.use("/payment", router);
}