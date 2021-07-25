module.exports = app => {
    const user = require("../../controllers/backoffice/backoffice.controller");
    const agentcat = require("../../controllers/backoffice/agentcat.controller");
    const { checktoken, validatetoken, validateCaptcha } = require("../../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.post("/createuser",validatetoken, user.createUser);
    router.post("/createagent",validatetoken, user.createAgent);
    router.post("/updateuser",validatetoken, user.updateUser);
    router.post("/updatecustomer",validatetoken, user.updateCustomer);
    router.post("/updateagent",validatetoken, user.updateAgent);
    router.post("/findlistagent",validatetoken, user.findAllAgent);
    router.get("/findlistuser",validatetoken, user.findAllUser);
    router.post("/finddetailagent",validatetoken, user.findDetailAgent);
    router.post("/finddetailuser",validatetoken, user.findDetailUser);
    router.post("/findlistcustomer",validatetoken, user.findAllCustomer);
    router.post("/finddetailcustomer",validatetoken, user.findDetailCustomer);
    router.get("/findallagentcategory",validatetoken, agentcat.findAllAgentCategory);
    router.get("/createrandomuserid",validatetoken, user.createRandomID);
    router.get("/findagentnotinuser",validatetoken, user.findAgentNotInUser);

    //Prefix
    app.use("/backoffice", router);
}