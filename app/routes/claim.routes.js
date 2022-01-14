module.exports = app => {
    const claim = require("../controllers/claim.controller");
    const { checktoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    
    router.post("/checkstatus",checktoken,claim.ClaimStatus)

    //Prefix
    app.use("/claim", router);
}