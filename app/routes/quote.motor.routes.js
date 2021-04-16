module.exports = app => {
    const quote = require("../controllers/quote.controller");
    const { checktoken } = require("../auth/token_validation")
    

    let router = require("express").Router();
    

    // Routes
    router.post("/createquote",checktoken,  quote.CreateQuote);
    router.put("/quotes/:id/uploadfrontview",checktoken, quote.uploadFrontView);
    router.put("/quotes/:id/uploadbackview",checktoken, quote.uploadBackView);
    router.put("/quotes/:id/uploadleftview",checktoken, quote.uploadLeftView);
    router.put("/quotes/:id/uploadrightview",checktoken, quote.uploadRightView);
    router.get("/quote/:id",checktoken, quote.getQuotebyPK);

    //Prefix
    app.use("/motor", router);
}