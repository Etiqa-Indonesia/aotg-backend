const { json } = require('body-parser');
const { insertLog } = require('../services/error.log.service');



exports.insertLog = async (req, res) => {

    var InsertData = {
        DataLog : JSON.stringify(req.body.DataLog) ,
        DateLog : Date.now(),
        APIName : req.body.APIName,
    }
    await insertLog(InsertData);

    res.status(200).send({
        success: 200
    })
}