module.exports = app => {
    const customer = require("../controllers/customer.controller");
    const { checktoken, validatetoken } = require("../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.post("/search/:id",validatetoken, customer.getListCustomer);

    //Prefix
    app.use("/api/customer", router);
}