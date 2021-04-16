module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const { checktoken } = require("../auth/token_validation")
    const {testSendMail} = require("../services/test.service")

    let router = require("express").Router();

    // Routes
    router.post("/createuser",checktoken, user.createUser);
    router.post("/createagent",checktoken, user.createAgent);

    router.get("/:id",checktoken, user.findUser);

    router.post("/login",  user.getLogin);
    router.post("/test",  testSendMail);

    //Prefix
    app.use("/api/user", router);
}