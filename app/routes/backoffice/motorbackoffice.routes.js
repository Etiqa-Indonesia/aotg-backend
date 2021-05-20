module.exports = app => {
    const motor = require("../../controllers/backoffice/motor.controller");
    const motorquote = require("../../controllers/quote.controller");
    const { checktoken } = require("../../auth/token_validation")

    let router = require("express").Router();

    // Routes
    router.get("/listdashboard/:role",checktoken, motor.getMotorDashboard);
    router.post("/listdetaildashboard/:role",checktoken, motor.getMotorQuote);
    router.get("/quote/:id",checktoken, motorquote.getQuotebyPK);
    router.post("/approve/quote/:id",checktoken, motorquote.ApproveQuote);

    router.get("/quote/backimage/:id",checktoken, motorquote.getImageBackViewBase64);
    router.get("/quote/frontimage/:id",checktoken, motorquote.getImageFrontViewBase64);
    router.get("/quote/leftimage/:id",checktoken, motorquote.getImageLeftViewBase64);
    router.get("/quote/rightimage/:id",checktoken, motorquote.getImageRightViewBase64);
    router.get("/quote/insideimage/:id",checktoken, motorquote.getImageInsideViewBase64);
    router.get("/quote/insideimagetest/:id",checktoken, motorquote.getImageInsideViewBase64);
    

    //Prefix
    app.use("/backoffice/motor", router);
}