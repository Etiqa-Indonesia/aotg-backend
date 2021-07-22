const { createResponseLog } = require("../services/responselog.service");

const DataLog = {
    QuotationID: null,
    URL: null,
    isError: null,
    Param: null,
    StatusCode: null,
    Response: null
};

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const SaveCareLog = (ResponseCareUser, StatusCode, ID, ParamSend, Config) => {
    DataLog.QuotationID = ID;
    DataLog.URL = Config;
    DataLog.isError = StatusCode == '200' ? 0 : 1;
    DataLog.Param = JSON.stringify(ParamSend);
    DataLog.StatusCode = StatusCode;
    DataLog.Response = ResponseCareUser

    createResponseLog(DataLog);
}

const PasswordPolicy = (text) => {
    var isAllowed = true;
    var Match = text.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    //(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/)
    // (?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d^a-zA-Z0-9].{6,}$
    
    if (!Match) {
        isAllowed = false;
    }

    return isAllowed
}

// ERROR HANDLING
// maybe can put in shared folder
exports.badRequest = async (req, res, error) => {
    res.status(400).send({
        'code': '400',
        'message': 'Bad Request',
        'error': error
    })
}

exports.unauthorized = async (req, res, error) => {
    res.status(401).send({
        'code': '401',
        'message': 'Unauthorized',
        'error': error
    })
}

exports.internalServerError = async (req, res, error) => {
    res.status(500).send({
        'code': '500',
        'message': 'Internal Server Error',
        'error': error
    })
}

exports.success = async (req, res, data) => {
    res.status(200).send({
        'code': '200',
        'message': 'Success',
        'data': data
    })
}



module.exports = {
    D: formatDate,
    SaveCareLog : SaveCareLog,
    PasswordPolicy: PasswordPolicy
}