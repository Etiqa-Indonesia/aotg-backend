const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const config = require('../../config/db.config');
const path = require("path");
const { createResponseLog } = require("../../services/responselog.service");


var transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secureConnection: config.mailSecure,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
});
var transporterEtiqa = nodemailer.createTransport({
    host: config.mailHostEtiqa,
    port: config.mailPortEtiqa,
    secureConnection: config.mailSecureEtiqa,
    auth: {
        user: config.mailUserEtiqa,
        pass: config.mailPassEtiqa
    }
});
const DataLog = {
    QuotationID: null,
    URL: null,
    isError: null,
    Param: null,
    StatusCode: null,
    Response: null
};

const readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

const SaveCareLog = (ResponseCareUser, StatusCode, ID, ParamSend, Config) => {
    DataLog.QuotationID = ID;
    DataLog.URL = Config;
    DataLog.isError = StatusCode == '200' ? 0 : 1;
    DataLog.Param = JSON.stringify(ParamSend);
    DataLog.StatusCode = StatusCode;
    DataLog.Response = ResponseCareUser

    createResponseLog(DataLog);
}

module.exports = {
    SendMail: async (data) => {
        console.log(data);
        
        if (data.Email[0]) {
            readHTMLFile(data.Pathfile, function (err, html) {
                var template = handlebars.compile(html);
                var replacements = {
                    Name: data.Name,
                    LinkBackOffice: config.linkBackOffice,
                    QuotationID : data.QuotationID
                };
                var htmlToSend = template(replacements);
                var mailOptions = {
                    from: config.mailUser,
                    to: data.Email,
                    subject: config.subjectMailCreateQuote,
                    html: htmlToSend
                };
                const MailInfo = 'Email sent to Marketing: ' + data.Email + ', untuk Informasi CreateQuote';

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        SaveCareLog(error, '400', data.QuotationID, data.QuotationID, 'SendEmail');
                    } else {
                        SaveCareLog(MailInfo, '200', data.QuotationID, data.QuotationID, 'SendEmail');
                        return (console.log('Email sent '));
                    }
                });

            });
        }
        else {
            console.log('Gagal')
            SaveCareLog('Failed Send Mail : Data Email Marketing tidak tersedia', '400', data.QuotationID, data.QuotationID, 'SendEmail');
        }

    },
    SendMailTest: async (callback) =>{
        var mailOptions = {
            from: config.mailUser,
            to: 'rhega.rofiat@etiqa.co.id',
            subject: "Test Send mail using Domain Etiqa",
            html: 'Test'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return callback(error, null);
            } else {
                console.log("sent")
                return callback(null, info);
            }
        });

    }

}