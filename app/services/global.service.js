const { createResponseLog } = require("../services/responselog.service");
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const config = require('../config/db.config');
const path = require("path");
const { ok } = require("assert");
const ua = require('universal-analytics');
const gaTrackingId = 'UA-186333861-1'
const dbConfig = require('../config/db.config')
const { findToproBasedOnYear } = require("../services/rate.service");
const midtransClient = require('midtrans-client');


const DataLog = {
    QuotationID: null,
    URL: null,
    isError: null,
    Param: null,
    StatusCode: null,
    Response: null
};

const InvoiceMidtrans = async (data, res) => {
    let snap = new midtransClient.Snap({
        serverKey: dbConfig.server_key,
        clientKey: dbConfig.client_key
    });

    let parameter = {
        "transaction_details": {
            "order_id": "test-transaction-123",
            "gross_amount": 200000
        }, "credit_card": {
            "secure": true
        },
        // "enabled_payments": ["gopay"]
    };

    const redirectURL = await snap.createTransaction(parameter)
    return redirectURL
}

const EIICareUser = (dataname, datano) => {
    var EIIID = 'AOTG-' + datano
    return EIIID
}

const DateFormatMMDDYY = (datedb) => {
    var date = new Date(datedb);
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    var formatdate= month + '/' + day + '/' + year

    return formatdate
}

const EIICareUserOld = (dataname, datano) => {
    var EIIID = 'AOTG-' + dataname + '-' + datano
    return EIIID
}

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

const GenerateOrderID = (ProductID, QuotationID) => {
    let ReferenceYear = 2000
    let year = new Date().getFullYear() - ReferenceYear

    const OrderID = year + ProductID + '-AOTG' + '-' + QuotationID + '-' + generateToday()

    return OrderID
}

const generateToday = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + dd + yyyy;

    return today
}

const FindToproUsed = async (TypeVehicle, AgentType, Description) => {

    if (dbConfig.truckType.indexOf(TypeVehicle.toLowerCase()) !== -1) {
        console.log('Masuk Tronton')
        return await findToproBasedOnYear(AgentType, dbConfig.TypeOfToproUsed[2], Description)
    }
    else {
        return await findToproBasedOnYear(AgentType, dbConfig.TypeOfToproUsed[1], Description)

    }
}
var transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secureConnection: config.mailSecure,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    },
});

const sendMail = async (to, subject, filename, path, id, MailInfo) => {

    const attachments = [
        {
            filename: filename,
            path: path
        }
    ];
    console.log(attachments)

    var mailOptions = {
        from: config.mailUser,
        to: CustEmail,
        subject: subject,
        attachments: attachments
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        } else {
            SaveCareLog(MailInfo, '200', id, id, 'SendEmail');
            return (console.log('Email sent to: ' + data[index]['Customer.Email']));
        }
    });

    return ok
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

const numberWithCommas = async (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

const TrackEvent = async (data) => {
    const visitor = ua(config.gaTrackingID);

    visitor
        .transaction({ ti: 'Quotation', tr: data.totalPayable, ta: 'eii', in: 'quotation' })
        .item({ ip: data.totalPayable, iq: 1, ic: data.agentCode, in: `${data.agentCode}_${data.regionId}`, iv: data.regionId })
        .send()

    return 'Success'
}


module.exports = {
    D: formatDate,
    SaveCareLog: SaveCareLog,
    PasswordPolicy: PasswordPolicy,
    numberWithCommas: numberWithCommas,
    sendMail: sendMail,
    TrackEvent: TrackEvent,
    FindToproUsed: FindToproUsed,
    InvoiceMidtrans: InvoiceMidtrans,
    EIICareUser: EIICareUser,
    GenerateOrderID: GenerateOrderID,
    EIICareUserOld: EIICareUserOld,
    DateFormatMMDDYY: DateFormatMMDDYY
}