module.exports = app => {
    const claim = require("../controllers/claim.controller");
    const { checktoken, validatetoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    
    router.post("/checkstatus",validatetoken,claim.ClaimStatus)

    //Prefix
    app.use("/claim", router);
}