const { checktoken,validatetoken } = require("../auth/token_validation")

module.exports = app => {
    

    let router = require("express").Router();

    router.use('/products',validatetoken, require('./motor/product'))
    router.use('/listing',validatetoken, require('./motor/listing'))
    router.use('/premium',validatetoken, require('./motor/premium'))

    //Prefix
    app.use('/motor', router);
}