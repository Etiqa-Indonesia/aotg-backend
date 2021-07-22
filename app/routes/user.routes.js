module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const { checktoken } = require("../auth/token_validation")
    const {testSendMail} = require("../services/test.service")
    const { decrypt, encrypt } = require('../auth/encrypt')

    let router = require("express").Router();

    // Routes
    router.post("/createuser",checktoken, user.createUser);
    router.post("/createagent",checktoken, user.createAgent);
    router.post("/resetpassword", user.forgotPassword);
    router.post("/updatepassword",checktoken, user.updatePassword);

    router.get("/:id",checktoken, user.findUser);

    router.post("/login", user.getLogin);
    router.post("/backoffice/login", user.getLoginBO);
    router.post("/logout", user.logoutBackoffice);
    //router.get("/logout/invalidatetoken", user.getlogoutBackoffice);
    router.get("/token/validate",  user.validateBackofficeToken);

    router.get("/encrypt/:text",checktoken,  user.encrypt);
    router.get("/decrypt/:text",checktoken,  user.decrypt);
    // router.post("/test",  testSendMail);

    //Prefix
    app.use("/api/user", router);
}