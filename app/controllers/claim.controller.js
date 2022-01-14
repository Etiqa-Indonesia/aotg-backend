const { createResponseLog } = require('../services/responselog.service')
const MWClient = require('../mw/motor/mw.motor.client')
const dbConfig = require('../config/db.config')


const SaveCareLog = (ResponseCareUser, StatusCode, ID, ParamSend, Config) => {

    const DataLog = {
        QuotationID: ID,
        URL: Config,
        isError: StatusCode == '200' ? 0 : 1,
        Param: JSON.stringify(ParamSend),
        StatusCode: StatusCode,
        Response: JSON.stringify(ResponseCareUser)
    };

    createResponseLog(DataLog);
}
exports.ClaimStatus = async (req, res) => {
    const results = await MWClient.SearchStoreClaim(
        req.body
    )
    SaveCareLog(results.data,results.data.code, null,req.body,dbConfig.searchStoreClaim)
    res.status(200).json({
        data: results.data
    });

};