const db = require("../models");
const Quotation = db.Quotation;
const Op = db.Sequelize.Op;
const { RetrieveFile } = require('./care.service')
const { createResponseLog } = require('./responselog.service')
const config = require('../config/db.config')
const fs = require('fs');
const path = require("path");
const DIRPOLICY = path.join(__dirname, '/../../policies/');
const { updateQuotationforRetrieveFile, updateQuotationforSentMail } = require('./quotation.service')
// var cron = require('node-cron');

const DataLog = {
    QuotationID: null,
    URL: null,
    isError: null,
    Param: null,
    StatusCode: null,
    Response: null
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
module.exports = app => {
    Quotation.findAll(
        {
            where: {
                IsSubmittedCare: 1,
                EfilePath: {
                    [Op.is]: null, // Like: status IS NULL
                },
                MailFetchTries: {
                    [Op.lt]: 9
                }
            },
            raw: true,
            attributes: ['CarePolicyID', 'QuotationID', 'PolicyNo', 'MailFetchTries']

        })
        .then((data) => {
            if (data != null) {
                try {
                    // console.log()
                    for (let index = 0; index < data.length; index++) {
                        const MailFetchTries = data[index].MailFetchTries;
                        const dataUpdateQuote = {
                            MailFetchTries: MailFetchTries + 1,
                            MailSent: 0
                        };
                        const Policy = {
                            PID: data[index].CarePolicyID
                        }
                        var ResponseCarePolicy = null;
                        RetrieveFile(JSON.stringify(Policy), async (err, resultRetrieveFile) => {
                            if (err) {
                                // console.log(err)
                                const Response = "Error Cek Param yang dikirim & E Policy gagal dilakukan";
                                const Status = 422;
                                SaveCareLog(err, Status, data[index].QuotationID, Policy, config.efilePolicyCareURL);
                                dataUpdateQuote.MailFetchTries = 9;
                                updateQuotationforSentMail(data[index].QuotationID, dataUpdateQuote)
                            }
                            else {

                                const EfileName = data[index].PolicyNo + '.pdf';
                                const FilePath = path.join(DIRPOLICY + '/' + EfileName);
                                ResponseCarePolicy = resultRetrieveFile.data;
                                const image = ResponseCarePolicy.Data;
                                var bitmap = new Buffer.from(image, 'base64');
                                fs.writeFile(FilePath, image, { encoding: 'base64' }, (error) => {
                                    if (error) {
                                        SaveCareLog(error, '400',
                                            data[index].QuotationID, Policy, config.efilePolicyCareURL);
                                        dataUpdateQuote.MailFetchTries = 9;
                                        updateQuotationforSentMail(data[index].QuotationID, dataUpdateQuote)
                                    }
                                    else {
                                        if (ResponseCarePolicy.code != '200') {
                                            SaveCareLog(JSON.stringify(ResponseCarePolicy), ResponseCarePolicy.code,
                                                data[index].QuotationID, Policy, config.efilePolicyCareURL);
                                            updateQuotationforSentMail(data[index].QuotationID, dataUpdateQuote)
                                        }
                                        else {
                                            console.log("Doc saved!");
                                            updateQuotationforRetrieveFile(data[index].QuotationID, FilePath);
                                            ResponseCarePolicy.Data = FilePath;
                                            SaveCareLog(JSON.stringify(ResponseCarePolicy), ResponseCarePolicy.code,
                                                data[index].QuotationID, Policy, config.efilePolicyCareURL);

                                        }

                                    }

                                });
                            }

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