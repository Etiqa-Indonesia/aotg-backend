const db = require("../models");
const Quotation = db.Quotation;
const Invoices = db.Invoices;
const Op = db.Sequelize.Op;
const MwClient = require('../mw/motor/mw.motor.client')
const { createResponseLog } = require('./responselog.service')
const { updateInvoices } = require('../services/invoices.service')
const dbConfig = require("../config/db.config");


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
module.exports = app => {

    Invoices.hasOne(Quotation, { foreignKey: 'QuotationID', sourceKey:'QuotationID' });
    Invoices.findAll(
        {
            where: {
                Status: 'settlement',
                PaymentStatusCode: '200',
                IsUploadARBucket: {
                    [Op.is]: null
                }
            },
            include: [
                {
                    model: Quotation,
                    attributes: ['PolicyNo']

                }
            ],
            attributes: ['Amount', 'QuotationID']
        }).then(async (data) => {
            for (let i = 0; i < data.length; i++) {

                const DataUploadARBucket = {
                    PolicyNo: data[i].Quotation.PolicyNo,
                    Currency: "IDR",
                    AmountPaid: data[i].Amount,
                    Charges: "0"
                }
                try {
                    const result = await MwClient.UploadARBucket(DataUploadARBucket)
                    console.log(result.data)
                    SaveCareLog(result.data,result.data.code,data[i].QuotationID,DataUploadARBucket,dbConfig.uploadARBucket)
                    if (result.data.code ==='200') {
                        const UpdateDataInvoices = {
                            IsUploadARBucket : 1
                        }
                        updateInvoices(data[i].QuotationID,UpdateDataInvoices)
                    }
                } catch (error) {
                    
                }




            }
        })
}