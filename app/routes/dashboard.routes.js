module.exports = app => {
    const dashboard = require("../controllers/dashboard.controller");
    const { checktoken,validatetoken } = require("../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.post("/motor/:role/:agentid",validatetoken, dashboard.getMotorDashboard);
    router.post("/motor/quote/:agentid/:role",validatetoken, dashboard.getMotorQuote);

    //Prefix
    app.use("/api/dashboard", router);
}