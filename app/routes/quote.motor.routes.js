module.exports = app => {
    const quote = require("../controllers/quote.controller");
    const vehicletype = require("../controllers/vehicletype.controller");
    const { checktoken,validatetoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    

    // Routes
    router.post("/createquote",validatetoken,  quote.CreateQuote);
    router.post("/senddraftquotation",validatetoken,  quote.SendMailDraftQuoteUsingID);
    router.post("/approve/quote/:id",validatetoken,  quote.ApproveQuote);
    router.put("/quotes/:id/uploadfrontview",validatetoken, quote.uploadFrontView);
    router.put("/quotes/:id/uploadbackview",validatetoken, quote.uploadBackView);
    router.put("/quotes/:id/uploadleftview",validatetoken, quote.uploadLeftView);
    router.put("/quotes/:id/uploadrightview",validatetoken, quote.uploadRightView);
    router.put("/quotes/:id/uploadinsideview",validatetoken, quote.uploadInsideView);
    router.get("/quote/:id",validatetoken, quote.getQuotebyPK);
    router.get("/quote/backimage/:id",validatetoken, quote.getImageBackViewBase64);
    router.get("/quote/frontimage/:id",validatetoken, quote.getImageFrontViewBase64);
    router.get("/quote/leftimage/:id",validatetoken, quote.getImageLeftViewBase64);
    router.get("/quote/rightimage/:id",validatetoken, quote.getImageRightViewBase64);
    router.get("/quote/insideimage/:id",validatetoken, quote.getImageInsideViewBase64);
    
    router.get("/findtopro/agentid/:agentid/vehicleyear/:vehicleyear",validatetoken, quote.findToproBasedOnYear);

    router.get("/platecodeinfo/:pcode",validatetoken, quote.findPlateCode);

    router.post("/createpdf",  quote.testCreatePDF);

    router.get("/vehicletypeallowed/agentype/:agentcatid/vehicletype/:vehicletype/:id/year/:year",validatetoken, vehicletype.findAllVehicleTypeAllowed);

    //Prefix
    app.use("/motor", router);
}