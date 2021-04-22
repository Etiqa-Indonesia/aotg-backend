module.exports = app => {
    const quote = require("../controllers/quote.controller");
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
    router.get("/quote/backimage/:id",checktoken, quote.getImageBackView);
    router.get("/quote/frontimage/:id",checktoken, quote.getImageFrontView);
    router.get("/quote/leftimage/:id",checktoken, quote.getImageLeftView);
    router.get("/quote/rightimage/:id",checktoken, quote.getImageRightView);

    //Prefix
    app.use("/motor", router);
}