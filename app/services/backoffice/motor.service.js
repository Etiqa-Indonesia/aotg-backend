const db = require("../../models");
const { QueryTypes } = require('sequelize');
const config = require("../../config/mw.config");
const configdb = require("../../config/db.config");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const Agent = db.Agent;
const Customer = db.Customer;
const Invoices = db.Invoices;



module.exports = {
    getMotorDashboard: async (data, callback) => {
        let where = {}
        where.TOC = data.TOC
        where.Status = { [Op.ne]: 'D' }
        // if (createdAtFrom && createdAtTo && createdAtFrom != 'null' && createdAtTo != 'null') {
        //     let createdFrom = new Date(createdAtFrom)
        //     let createdTo = new Date(createdAtTo)
        //     createdTo.setDate(createdTo.getDate() + 1)
        //     where.createdAt = { [Op.between]: [createdFrom, createdTo] }
        // }
        // if (data.Role === 'bizcare') where = { [Op.or]: ['TCP', 'CCP'] }
        await Quote.findAll(
            {
                where: where,
                raw: true,
                attributes: ['Status',
                    [db.sequelize.fn('COUNT', db.sequelize.col('Status')), 'count'],
                    [db.Sequelize.literal(`CASE WHEN Status ='0' THEN 'Quote Dibuat' 
                        WHEN Status = '2' THEN 'Quote Reject' ELSE 'Quote Disetujui' END`), 'StatusQuote']
                ],
                group: ['TOC', 'Status', 'StatusQuote']
                // order: ['UpdateDate', 'DESC']
            })
            .then((data) => {
                if (data != null) {
                    try {
                        return callback(null, data);
                    }
                    catch (error) {
                        return callback(error);
                    }
                }
                return callback(err, data);
            }).catch((error) => {
                return callback(error);
            });

    },
    getMotorQuote: async (data, Role, page, CustomerName, callback) => {
        let where = {}
        where.Status = data.Status
        where.TOC = data.TOC
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        await Quote.findAll(
            {
                where: where,
                include: [
                    {

                        model: Customer,
                        attributes: { exclude: ['CreateDate', 'UpdateDate'] },
                        where: {
                            CustomerName: { [Op.like]: `%${CustomerName}%` }
                        }

                    }
                ],
                limit: 10,
                offset: page * 10,
                // raw: true,
                attributes: ['QuotationID', 'CreateDate', 'UpdateDate', 'MainSI'],
                order: [
                    ['QuotationID', 'DESC']
                ]

            })
            .then((data) => {
                if (data != null) {
                    try {
                        return callback(null, data);
                    }
                    catch (error) {
                        console.log(error)
                        return callback(error);
                    }
                }
                return callback(err, data);
            }).catch((error) => {
                console.log(error)
                return callback(error);
            });
    },

    getSummaryAgentList: async (data, page) => {
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.hasOne(Invoices, { foreignKey: 'QuotationID' });
        
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
        if (data.IsPaid.toLowerCase() !== 'unpaid') {
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

        wherequotation.IsPaid = data.IsPaid.toLowerCase() === 'unpaid' ? 0 : 1
        wherequotation.TOC = configdb.motorproductid

        console.log(wherequotation)
        return await Quote.findAll({
            where: wherequotation,
            raw: false,

            include: [
                {
                    model: Customer,
                    attributes: ['CustomerName'],
                    required: false
                },
                {
                    model: Agent,
                    attributes: ['Name'],
                    required: false
                },
                {
                    model: Invoices,
                    attributes: ['Amount', 'PaymentTransactionTime'],
                    where: whereinvoices,
                    required: false
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
        if (id != null) {
            wherequotation.QuotationID = id
        }
        wherequotation.TOC = configdb.motorproductid

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
                    attributes: ['Amount', 'OrderID','Status','Currency','PaymentType','PaymentApprovalCode'],
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

    

