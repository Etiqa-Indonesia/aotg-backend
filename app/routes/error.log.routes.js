module.exports = app => {
    const errorlog = require("../controllers/errorlog.controller");
    const { checktoken,validatetoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    
    router.post("/error",validatetoken,errorlog.insertLog)

    //Prefix
    app.use("/log", router);
}