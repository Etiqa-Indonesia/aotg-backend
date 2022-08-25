const db = require("../models");
const Quotation = db.Quotation;
const QuoteDetailMV = db.QuotationMV;
const Customer = db.Customer;
const Coverage = db.Coverage;
const Agent = db.Agent;
const Op = db.Sequelize.Op;
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const config = require('../config/db.config');
const path = require("path");
const DIRHTML = path.join(__dirname, '../mail/motor.html');
const DIRPOLICY = path.join(__dirname, '../../policies/');
const { updateQuotationforSentMail } = require('./quotation.service');
const { createResponseLog } = require('../services/responselog.service');
const { policyNo } = require("../models/response/QuoteMotor.model");


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
var transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secure: false,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

module.exports = app => {
    Quotation.hasOne(QuoteDetailMV, { foreignKey: 'QuotationID' });
    // Quotation.hasMany(Coverage, { foreignKey: 'QuotationID' });
    Quotation.belongsTo(Customer, { foreignKey: 'CustomerID' });
    Quotation.belongsTo(Agent, { foreignKey: 'AgentID' });
    Quotation.findAll(
        {
            where: {
                IsSubmittedCare: 1,
                EfilePath: {
                    [Op.ne]: null,
                },
                MailSent: 0,
                MailFetchTries: {
                    [Op.lt]: 9
                }
            },
            raw: true,
            include: [{
                model: QuoteDetailMV,
                attributes: { exclude: ['QuotationID'] }

            },
            {
                model: Agent,
                attributes: ['Email']
            }
                , {
                model: Customer,
                attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

            }
            ],
            attributes: { exclude: ['CreateDate', 'UpdateDate'] },

        })
        .then((data) => {
            if (data != null) {
                try {
                    // console.log(data)
                    for (let index = 0; index < data.length; index++) {
                        readHTMLFile(DIRHTML, function (err, html) {
                            // console.log(data[index]['Agent.Email'])
                            const filePath = path.join(DIRPOLICY, data[index].PolicyNo + '.pdf')
                            const QuotationID = data[index].QuotationID;
                            const CustomerName = data[index]['Customer.CustomerName'];
                            const MailFetchTries = data[index].MailFetchTries;
                            const StartDate = data[index].StartDate;
                            const CustIDNo = data[index]['Customer.IDNo'];
                            const LicenseNo = data[index]['QuoDetailMV.LicenseNo'];
                            const PolicyNo = data[index].PolicyNo;
                            const PremiumAmount = data[index].PolicyCost;

                            const CustEmail = data[index]['Customer.Email'];
                            const AgentEmail = data[index]['Agent.Email'];
                            const dataUpdateQuote = {
                                MailFetchTries: MailFetchTries + 1,
                                MailSent: 1
                            };
                            var template = handlebars.compile(html);
                            var replacements = {
                                customer_name: CustomerName,
                                transaction_date: formatDate(StartDate),
                                id_no: CustIDNo,
                                veh_reg_no: LicenseNo,
                                policy_no: PolicyNo,
                                premium_amount: PremiumAmount
                            };
                            var htmlToSend = template(replacements);
                            //  console.log(data[index]['Agent.Email'])

                            const attachments = [
                                {
                                    filename: data[index].PolicyNo + '.pdf',
                                    path: path.join(__dirname, '../../policies/', data[index].PolicyNo + '.pdf'),
                                }
                            ];
                            var mailOptions = {
                                from: config.mailUser,
                                to: CustEmail,
                                cc: AgentEmail,
                                bcc: AgentEmail,
                                subject: 'Polis Asuransi Kendaraan Bermotor',
                                html: htmlToSend,
                                attachments: attachments
                            };

                            const MailInfo = 'Email sent to: ' + data[index]['Customer.Email'] + ' QuotationID : ' + QuotationID;
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    dataUpdateQuote.MailSent = 0;
                                    updateQuotationforSentMail(QuotationID, dataUpdateQuote)
                                    console.log(error);
                                } else {
                                    updateQuotationforSentMail(QuotationID, dataUpdateQuote)
                                    SaveCareLog(MailInfo, '200', QuotationID, QuotationID, 'SendEmail');
                                    return (console.log('Email sent to: ' + data[index]['Customer.Email']));
                                }
                            });

                        });

                    }
                }
                catch (error) {
                    console.log(error)
                }
            }
            else {
                console.log('No Data')
            }
        }).catch((error) => {
            console.log(error)
        });
}