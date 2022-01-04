module.exports = app => {
    const payment = require("../../controllers/backoffice/paymentBO.controller");
    const { validatetoken } = require("../../auth/token_validation")
    

    let router = require("express").Router();
    

    // Routes
    router.post("/listpayment",validatetoken, payment.getSummaryAgentList)
    router.get("/listpaymentdetail/quote/:id",validatetoken, payment.getSummaryAgentDetail)
    router.get("/invoicescount/toc/:TOC",validatetoken, payment.CountInvoiceListBO)

    //Prefix
    app.use("/backoffice", router);
}