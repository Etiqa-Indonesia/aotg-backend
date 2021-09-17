const { createResponseLog } = require("../services/responselog.service");
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const config = require('../config/db.config');
const path = require("path");
const { ok } = require("assert");
const ua = require('universal-analytics');
const gaTrackingId = 'UA-186333861-1'

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

var transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secureConnection: config.mailSecure,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
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
    TrackEvent: TrackEvent
}