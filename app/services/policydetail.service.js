const db = require("../models");
const Quotation = db.Quotation;
const Op = db.Sequelize.Op;
const MwClient = require('../mw/motor/mw.motor.client')
const { findInvoices, createInvoice, updateInvoices } = require('../services/invoices.service')
const { createResponseLog } = require('./responselog.service')
const { updateQuotationforPayment } = require('./quotation.service')
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
    Quotation.findAll(
        {
            where: {
                ANO: {
                    [Op.and]: {
                        [Op.ne]: null,
                        [Op.ne]: -1
                    }

                },
                IsPaid: {
                    [Op.or]: {
                        [Op.is]: null,
                        [Op.notIn]: [0, 1, -1] // 0 : ready to pay , 1: Paid , -1:Policy Not Found 
                    }

                }
            },
            attributes: ['ANO', 'QuotationID'],
            raw: false,
            order: [
                ['QuotationID', 'DESC']
            ]

        }).then(async (data) => {

            for (let i = 0; i < data.length; i++) {

                const dataGetPolicyDetail = {
                    ANO: data[i].ANO
                };

                let Result = await MwClient.GetPolicyDetail(dataGetPolicyDetail)
                console.log(Result.data.code)
                if (Result.data.code !== '400') {
                    const dataCreateInvoices = {
                        QuotationID: data[i].QuotationID,
                        Amount: Result.data.Data.Payment[0].Amount_Total,
                        CreateDate: Date.now()
                    }
                    if (Result.data.Data.Payment[0].Total_Paid === 0) {
                        const CheckInvoices = await findInvoices(data[i].QuotationID)
                        if (!CheckInvoices) {
                            try {
                                await createInvoice(dataCreateInvoices)
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    }

                    SaveCareLog(Result.data.Data.Payment[0], Result.data.code, data[i].QuotationID, data[i].ANO, dbConfig.searchStoreDetailPolicy)
                }
                const dataUpdatePayment = {
                    IsPaid: 0,
                }

                if (Result.data.code === '400') {
                    Result.data.Data = 'Policy Not Found'
                    dataUpdatePayment.IsPaid = -1

                    SaveCareLog(Result.data.Data, Result.data.code, data[i].QuotationID, data[i].ANO, dbConfig.searchStoreDetailPolicy)
                }


                updateQuotationforPayment(data[i].QuotationID, dataUpdatePayment)
            }

        })

}