const { checktoken } = require("../auth/token_validation")

module.exports = app => {
    

    let router = require("express").Router();

    router.use('/products',checktoken, require('./motor/product'))
    router.use('/listing',checktoken, require('./motor/listing'))
    router.use('/premium',checktoken, require('./motor/premium'))

    //Prefix
    app.use('/motor', router);
}