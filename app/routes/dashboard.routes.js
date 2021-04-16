module.exports = app => {
    const dashboard = require("../controllers/dashboard.controller");
    const { checktoken } = require("../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.post("/motor/:role/:agentid",checktoken, dashboard.getMotorDashboard);
    router.post("/motor/quote/:agentid/:role",checktoken, dashboard.getMotorQuote);

    //Prefix
    app.use("/api/dashboard", router);
}