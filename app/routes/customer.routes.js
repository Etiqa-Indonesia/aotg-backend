module.exports = app => {
    const customer = require("../controllers/customer.controller");
    const { checktoken } = require("../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.post("/search/:id",checktoken, customer.getListCustomer);

    //Prefix
    app.use("/api/customer", router);
}