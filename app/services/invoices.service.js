const db = require("../models");
const Op = db.Sequelize.Op;
const Invoices = db.Invoices;
const Quote = db.Quotation;
const Agent = db.Agent;
const Customer = db.Customer;
const dbConfig = require('../config/db.config')
const midtransClient = require('midtrans-client');
const { GenerateOrderID } = require('../services/global.service')
const crypto = require('crypto')


module.exports = {
    getInvoiceList: async (data) => {
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        let where = {}
        where.IsPaid = data.IsPaid.toLowerCase() === 'unpaid' ? 0 : 1
        where.TOC = data.TOC
        where.AgentID = data.AgentID

        return await Quote.findAll({
            where: where,
            raw: false,
            include: [
                {
                    model: Customer,
                    attributes: ['CustomerName']
                },
                {
                    model: Invoices,
                    attributes: ['Amount', 'PaymentTransactionTime', 'PaymentSettlementTime']
                }
            ],
            attributes: ['QuotationID', 'PolicyNo', 'MainSI'],
            order: [
                ['QuotationID', 'DESC']
            ]
        })

    },
    createInvoice: async (data) => {
        await Invoices.create(data)
    },

    validatePaymentSignature: async (data) => {
        const concatString = data.order_id + data.status_code + data.gross_amount + dbConfig.server_key
        const hashString = crypto.createHash('sha512').update(concatString).digest('hex');
        if (hashString == data.signature_key) {
            return true
        }
        return false
    },
    findInvoices: async (QuotationID) => {
        return await Invoices.findOne(
            {
                where: { QuotationID: QuotationID }
            }
        )
    },
    findInvoicesByOrderID: async (OrderID) => {
        return await Invoices.findOne(
            {
                where: { OrderID: OrderID },
                attributes: ['QuotationID']
            }
        )
    },
    updateInvoices: async (QuotationID, data) => {
        await Invoices.update(data, {
            where: {
                QuotationID: QuotationID
            }
        });

    },
    InvoiceMidtrans: async (data, res) => {
        let snap = new midtransClient.Snap({
            serverKey: dbConfig.server_key,
            clientKey: dbConfig.client_key
        });

        let parameter = {
            "transaction_details": {
                "order_id": GenerateOrderID(data.productid, data.quotationid),
                "gross_amount": data.amount
            }
        };
        const results = {
            message: null,
            statuscode: null,
            response: null,
        }

        try {
            const result = await snap.createTransaction(parameter)
            results.message = 'OK'
            results.statuscode = 200
            results.response = result
            return results
        } catch (error) {
            var errmsg = ''
            var statuscode = error.httpStatusCode.toString()
            console.log(statuscode)
            if (statuscode == 401) {
                errmsg = 'Access Denied'
            }
            else if (statuscode.substring(0, 1) == '4') {
                errmsg = 'Transaction Order ID sudah pernah digunakan'
            }
            else {
                errmsg = 'Midtrans Error, silahkan coba beberapa saat lagi'
            }
            results.message = 'Error'
            results.statuscode = error.httpStatusCode
            results.response = errmsg

            return results
        }
    },
    CountInvoiceList: async (data) => {
        let where = {}
        where.TOC = data.TOC
        where.AgentID = data.AgentID
        where.IsPaid = {
            [Op.not]: null, // Like: status IS NOT NULL
        }
        return await Quote.findAll({
            where: where,
            raw: false,
            attributes: [
                [db.sequelize.fn('COUNT', db.sequelize.col('IsPaid')), 'count'],
                [db.Sequelize.literal(`CASE WHEN IsPaid ='0' THEN 'Belum Bayar' 
                        WHEN IsPaid = '1' THEN 'Sudah Bayar 'END`), 'StatusPaid']
            ],
            group: ['IsPaid'],
            order: [
                ['QuotationID', 'DESC']
            ]
        })
    },
    TotalProductionList: async (AgentID, CustomerName) => {
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        Invoices.belongsTo(Quote, { foreignKey: 'QuotationID' });
        return await Quote.findAll({
            where: {
                AgentID: AgentID,
                IsPaid: {
                    [Op.not]: null, // Like: status IS NOT NULL
                }
            },
            raw: false,
            include: [
                {
                    model: Customer,
                    attributes: ['CustomerName'],
                    where: {
                        CustomerName: {
                            [Op.like]: '%' + CustomerName + '%'
                        }
                    }
                },
                {
                    model: Invoices,
                    required: false,
                    attributes: ['Amount']

                }
            ],
            attributes: [
                'PolicyNo', 'StartDate', 'EndDate',
                [db.Sequelize.literal(`CASE WHEN IsPaid ='0' THEN 'Belum Bayar' 
                        WHEN IsPaid = '1' THEN 'Sudah Bayar 'END`), 'StatusPaid']
            ],
            order: [
                ['QuotationID', 'DESC']
            ]
        })
    },
    TotalProductionSummary: async (AgentID, CustomerName) => {
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        Invoices.belongsTo(Quote, { foreignKey: 'QuotationID' });
        Quote.hasOne(Agent, { foreignKey: 'AgentID', sourceKey: 'AgentID' });
        return await Quote.findAll({
            where: {
                AgentID: AgentID,
                IsPaid: {
                    [Op.not]: null, // Like: status IS NOT NULL
                }
            },
            raw: false,
            include: [
                {
                    model: Customer,
                    attributes: [],
                    where: {
                        CustomerName: {
                            [Op.like]: '%' + CustomerName + '%'
                        }
                    }
                },
                {
                    model: Invoices,
                    required: false,
                    attributes: [
                        [db.sequelize.fn('sum', db.sequelize.col('Amount')), 'TotalAmount']
                    ]

                }
            ],
            attributes: [],
            order: [
                ['QuotationID', 'DESC']
            ]
        })
    },

    CollectionStatus: async (data) => {
        // Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        Invoices.belongsTo(Quote, { foreignKey: 'QuotationID' });
        return await Quote.findAll({
            where: {
                AgentID: data.AgentID,
                IsPaid: {
                    [Op.not]: null, // Like: status IS NOT NULL
                },
                TOC: data.TOC,
                [Op.and]: [
                    db.sequelize.where(db.sequelize.fn("month", db.sequelize.col("StartDate")), data.Month),
                    db.sequelize.where(db.sequelize.fn("year", db.sequelize.col("StartDate")), data.Year)
                ]
            },
            include: [
                {
                    model: Invoices,
                    required: false,
                    attributes: []

                }
            ],
            attributes: [
                'PolicyNo',
                [db.Sequelize.literal(`CASE WHEN IsPaid ='0' THEN 'Belum Bayar' 
                        WHEN IsPaid = '1' THEN 'Sudah Bayar 'END`), 'StatusPaid']
            ],
            order: [
                ['QuotationID', 'DESC']
            ]
        })
    },

}