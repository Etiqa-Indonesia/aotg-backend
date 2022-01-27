module.exports = app => {
    const errorlog = require("../controllers/errorlog.controller");
    const { checktoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    
    router.post("/error",checktoken,errorlog.insertLog)

    //Prefix
    app.use("/log", router);
}