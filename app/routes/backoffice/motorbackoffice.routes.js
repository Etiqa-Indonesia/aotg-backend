module.exports = app => {
    const motor = require("../../controllers/backoffice/motor.controller");
    const motorquote = require("../../controllers/quote.controller");
    const backoffice = require("../../controllers/backoffice/backoffice.controller");
    const agentcat = require("../../controllers/backoffice/agentcat.controller");
    const { checktoken,validatetoken } = require("../../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.get("/listdashboard/:role",validatetoken, motor.getMotorDashboard);
    router.get("/listdetaildashboard/:role/:status",validatetoken, motor.getMotorQuote);
    router.get("/quote/:id",validatetoken, motorquote.getQuotebyPK);
    router.post("/approve/quote/:id",validatetoken, motorquote.ApproveQuote);

    router.post("/reject/quote/:id",validatetoken, motorquote.RejectQuote);

    router.get("/quote/backimage/:id",validatetoken, motorquote.getImageBackViewBase64);
    router.get("/quote/frontimage/:id",validatetoken, motorquote.getImageFrontViewBase64);
    router.get("/quote/leftimage/:id",validatetoken, motorquote.getImageLeftViewBase64);
    router.get("/quote/rightimage/:id",validatetoken, motorquote.getImageRightViewBase64);
    router.get("/quote/insideimage/:id",validatetoken, motorquote.getImageInsideViewBase64);
    router.get("/quote/insideimagetest/:id",validatetoken, motorquote.getImageInsideViewBase64);


    router.get("/ratecode",validatetoken, motor.findAllRateCode);
    router.get("/vehicletype",validatetoken, motor.findAllVehicleType);
    router.get("/findagentdependencies/agentcategory/:agentcat",validatetoken, agentcat.findAllDependenciesAgentCategory);
    router.post("/submitagentdependencies",validatetoken, agentcat.submitAgentDependencies);
    


    router.post("/sendmail", backoffice.sendmailtest);

    // router.get("/agent", motor.getSummaryAgent);
    

    //Prefix
    app.use("/backoffice/motor", router);
}