const db = require("../../models");
const Op = db.Sequelize.Op;
const Invoices = db.Invoices;
const Quote = db.Quotation;
const Customer = db.Customer;
const Agent = db.Agent;
const configdb = require('../../config/db.config')


module.exports = {
    CountInvoiceListBO: async (data) => {
        let where = {}
        where.TOC = data.TOC
        where.IsPaid = {
            [Op.in] : [0,1]
        }
        if (data.AgentID !== null) {
            where.AgentID = data.AgentID
        }
        return await Quote.findAll({
            where: where,
            raw: false,
            attributes: [
                [db.sequelize.fn('COUNT', db.sequelize.col('IsPaid')), 'count'],
                [db.Sequelize.literal(`CASE WHEN IsPaid ='0' THEN 'Belum Bayar' 
                        WHEN IsPaid = '1' THEN 'Sudah Bayar' END`), 'StatusPaid']
            ],
            group: ['IsPaid'],
            order: [
                ['QuotationID', 'DESC']
            ]
        })
    },
    getSummaryAgentList: async (data, page) => {

        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        Invoices.belongsTo(Quote, { foreignKey: 'QuotationID' });
        Quote.hasOne(Agent, { foreignKey: 'AgentID', sourceKey: 'AgentID' });
        let wherequotation = {}
        let whereinvoices = {}
        if (data.PolicyNo != null) {
            wherequotation.PolicyNo = data.PolicyNo
        }
        if (data.AgentID != null) {
            wherequotation.AgentID = data.AgentID
        }
        if (data.QuotationID != null) {
            wherequotation.QuotationID = data.QuotationID
        }

        if (data.IsPaid.toLowerCase() == 'paid') {
            if (data.PaymentTransactionFrom != null && data.PaymentTransactionTo == null) {
                whereinvoices.PaymentTransactionTime = {
                    [Op.gte]: data.PaymentTransactionFrom
                }
            }
            if (data.PaymentTransactionFrom == null && data.PaymentTransactionTo != null) {
                whereinvoices.PaymentTransactionTime = {
                    [Op.lte]: data.PaymentTransactionTo
                }
            }
            if (data.PaymentTransactionFrom != null && data.PaymentTransactionTo != null) {
                whereinvoices.PaymentTransactionTime = {
                    [Op.between]: [data.PaymentTransactionFrom, data.PaymentTransactionTo]
                }
            }
        }

        if (data.IsPaid.toLowerCase() === 'unpaid') {
            wherequotation.IsPaid = 0
            if (data.PaymentTransactionFrom != null && data.PaymentTransactionTo == null) {
                wherequotation.CreateDate = {
                    [Op.gte]: data.PaymentTransactionFrom
                }
            }
            if (data.PaymentTransactionFrom == null && data.PaymentTransactionTo != null) {
                wherequotation.CreateDate = {
                    [Op.lte]: data.PaymentTransactionTo
                }
            }
            if (data.PaymentTransactionFrom != null && data.PaymentTransactionTo != null) {
                wherequotation.CreateDate = {
                    [Op.between]: [data.PaymentTransactionFrom, data.PaymentTransactionTo]
                }
            }
        }
        if (data.IsPaid.toLowerCase() === 'paid') {
            wherequotation.IsPaid = 1
        }
        if (data.IsPaid.toLowerCase() === 'unknown') {
            wherequotation.IsPaid = -1
        }
        wherequotation.TOC = data.ProductID

        return await Quote.findAll({
            where: wherequotation,
            raw: false,
            include: [
                {
                    model: Customer,
                    attributes: ['CustomerName']
                },
                {
                    model: Agent,
                    attributes: ['Name']
                },
                {
                    model: Invoices,
                    required: false,
                    attributes: ['Amount', 'PaymentTransactionTime'],
                    where: whereinvoices,
                    right: true

                }
            ],
            attributes: ['QuotationID', 'PolicyNo'],
            order: [
                ['QuotationID', 'DESC']
            ],

            limit: 10,
            offset: page * 10,
        })

    },
    getSummaryAgentDetail: async (id) => {
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        Invoices.belongsTo(Quote, { foreignKey: 'QuotationID' });
        Quote.hasOne(Agent, { foreignKey: 'AgentID', sourceKey: 'AgentID' });
        let wherequotation = {}

        wherequotation.QuotationID = id

        console.log(wherequotation)
        return await Quote.findAll({
            where: wherequotation,
            raw: false,

            include: [
                {
                    model: Customer,
                    attributes: ['CustomerName']
                },
                {
                    model: Agent,
                    attributes: ['Name']
                },
                {
                    model: Invoices,
                    attributes: ['Amount', 'OrderID', 'Status', 'Currency', 'PaymentType', 'PaymentApprovalCode'],
                    right: true
                }
            ],
            attributes: ['QuotationID', 'PolicyNo'],
            order: [
                ['QuotationID', 'DESC']
            ]
        })

    },
}
