module.exports = app => {
    const user = require("../../controllers/backoffice/backoffice.controller");
    const agentcat = require("../../controllers/backoffice/agentcat.controller");
    const { checktoken } = require("../../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.post("/createuser",checktoken, user.createUser);
    router.post("/createagent",checktoken, user.createAgent);
    router.post("/updateuser",checktoken, user.updateUser);
    router.post("/updatecustomer",checktoken, user.updateCustomer);
    router.post("/updateagent",checktoken, user.updateAgent);
    router.post("/findlistagent",checktoken, user.findAllAgent);
    router.get("/findlistuser",checktoken, user.findAllUser);
    router.post("/finddetailagent",checktoken, user.findDetailAgent);
    router.post("/finddetailuser",checktoken, user.findDetailUser);
    router.post("/findlistcustomer",checktoken, user.findAllCustomer);
    router.post("/finddetailcustomer",checktoken, user.findDetailCustomer);
    router.get("/findallagentcategory",checktoken, agentcat.findAllAgentCategory);
    router.get("/createrandomuserid",checktoken, user.createRandomID);
    router.get("/findagentnotinuser",checktoken, user.findAgentNotInUser);

    //Prefix
    app.use("/backoffice", router);
}