module.exports = app => {
    const quote = require("../controllers/quote.controller");
    const vehicletype = require("../controllers/vehicletype.controller");
    const { checktoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    

    // Routes
    router.post("/createquote",checktoken,  quote.CreateQuote);
    router.post("/approve/quote/:id",checktoken,  quote.ApproveQuote);
    router.put("/quotes/:id/uploadfrontview",checktoken, quote.uploadFrontView);
    router.put("/quotes/:id/uploadbackview",checktoken, quote.uploadBackView);
    router.put("/quotes/:id/uploadleftview",checktoken, quote.uploadLeftView);
    router.put("/quotes/:id/uploadrightview",checktoken, quote.uploadRightView);
    router.put("/quotes/:id/uploadinsideview",checktoken, quote.uploadInsideView);
    router.get("/quote/:id",checktoken, quote.getQuotebyPK);
    router.get("/quote/backimage/:id",checktoken, quote.getImageBackViewBase64);
    router.get("/quote/frontimage/:id",checktoken, quote.getImageFrontViewBase64);
    router.get("/quote/leftimage/:id",checktoken, quote.getImageLeftViewBase64);
    router.get("/quote/rightimage/:id",checktoken, quote.getImageRightViewBase64);
    router.get("/quote/insideimage/:id",checktoken, quote.getImageInsideViewBase64);

    router.get("/platecodeinfo/:pcode",checktoken, quote.findPlateCode);

    router.get("/vehicletypeallowed/agentype/:agentcatid/vehicletype/:vehicletype/:id",checktoken, vehicletype.findAllVehicleTypeAllowed);

    //Prefix
    app.use("/motor", router);
}