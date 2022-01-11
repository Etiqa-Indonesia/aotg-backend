const db = require("../models");
const Quotation = db.Quotation;
const Customer = db.Customer;
const Agent = db.Agent;
const Op = db.Sequelize.Op;
const MwClient = require('../mw/motor/mw.motor.client')
const { updateQuotationforANO } = require('../services/quotation.service')
const { EIICareUser, EIICareUserOld,DateFormatMMDDYY } = require('../services/global.service')
const { createResponseLog } = require('./responselog.service')
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
    Quotation.belongsTo(Customer, { foreignKey: 'CustomerID' });
    Quotation.belongsTo(Agent, { foreignKey: 'AgentID' });
    let OldUser = '2021/10/05 00:00:00'
    let NewUser = '2022/01/11 00:00:00'
    Quotation.findAll(
        {
            where: {
                IsSubmittedCare: 1,
                MailSent: 1, // Cron Run After Customer Get Policy By Mail
                EfilePath: {
                    [Op.not]: null, // Like: status IS NOT NULL
                },
                ANO: {
                    [Op.is]: null
                    // Like: status IS NULL
                },
                MailFetchTries: {
                    [Op.lt]: 9
                }
            },
            include: [
                {
                    model: Customer,
                    attributes: ['IDNo', 'CustomerName']

                },
                {
                    model: Agent,
                    attributes: ['ProfileID']

                }
            ],
            attributes: ['PolicyNo', 'MailFetchTries', 'QuotationID', 'UpdateDate','StartDate'],
            raw: false,
            order: [
                ['QuotationID', 'DESC']
            ]

        }).then(async (data) => {

            for (let i = 0; i < data.length; i++) {
                const QuoteDate = data[i].UpdateDate.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ")

                var AID = null
                if (OldUser > QuoteDate) { //SysUser MW lama lihat kolom PHolder & AID
                    AID = EIICareUserOld(data[i].Customer.CustomerName, data[i].Customer.IDNo)
                }
                else if (QuoteDate > OldUser && QuoteDate < NewUser){ //SysUser fixing Tapi ada bugs
                    
                    AID = EIICareUser('', data[i].Customer.IDNo)
                }
                else { //SysUserTerbaru & FIX  kolom PHolder & AID di MW
                    AID = data[i].Agent.ProfileID
                }
                const dataGetANO = {
                    ID: AID,
                    PolicyNo: data[i].PolicyNo,
                    EffectiveDate : DateFormatMMDDYY(data[i].StartDate.toISOString())
                };

                let Result = await MwClient.GetAno(dataGetANO)
                const dataUpdateANO = {
                    ANO: null,
                    MailFetchTries: data[i].MailFetchTries + 1,
                }

                if (Result.data.code !== '400') {
                    dataUpdateANO.ANO = Result.data.Data[0].ANO  //ambil row pertama ANO
                }

                if (Result.data.code === '400') {
                    Result.data.Data = 'Policy Not Found'
                    dataUpdateANO.ANO = -1
                }
                SaveCareLog(Result.data.Data, Result.data.code, data[i].QuotationID, dataGetANO, dbConfig.searchStorePolicy)
                updateQuotationforANO(data[i].QuotationID, dataUpdateANO)
            }

        })




}