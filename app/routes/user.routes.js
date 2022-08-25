module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const userbo = require('../controllers/backoffice/backoffice.controller')
    const { checktoken,validateCaptcha, keyReturnCaptcha, refreshtoken,validatetoken } = require("../auth/token_validation")
    const {testSendMail} = require("../services/test.service")
    const { decrypt, encrypt } = require('../auth/encrypt')

    let router = require("express").Router();

    // Routes
    router.post("/createuser",validatetoken, user.createUser);
    router.post("/createagent",validatetoken, user.createAgent);
    router.post("/resetpassword", user.forgotPassword);
    router.post("/updatepassword",validatetoken, user.updatePassword);

    router.get("/:id",validatetoken, user.findUser);

    router.post("/login", user.getLogin);
    router.post("/backoffice/login", validateCaptcha, user.getLoginBO);
    router.get("/backoffice/captchakey", userbo.returnkeyCaptcha )
    router.get("/backoffice/refreshtoken", refreshtoken)
    router.post("/logout", user.logoutBackoffice);
    //router.get("/logout/invalidatetoken", user.getlogoutBackoffice);
    router.get("/token/validate",  user.validateBackofficeToken);

    router.get("/encrypt/:text",validatetoken,  user.encrypt);
    router.get("/decrypt/:text",validatetoken,  user.decrypt);

    router.get("/paymenturl/invoice",  validatetoken, user.InvoiceMidtrans);
    // router.post("/test",  testSendMail);

    //Prefix
    app.use("/api/user", router);
}