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




module.exports = {
    D: formatDate,
    SaveCareLog : SaveCareLog,
    PasswordPolicy: PasswordPolicy
}