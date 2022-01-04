const db = require("../models");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const Agent = db.Agent;
const Customer = db.Customer;

module.exports = {
    getMotorDashboard: async (data, role, callback) => {
        if (role == 'M') { //Role for Approve Quote
            await Quote.findAll(
                {
                    raw: true,
                    attributes: [ 'Status',
                        [db.sequelize.fn('COUNT', db.sequelize.col('Status')), 'count'],
                        [db.Sequelize.literal(`CASE WHEN Status ='0' THEN 'Quote Dibuat' 
                        WHEN Status = '2' THEN 'Quote Reject' WHEN Status='D' THEN 'Draft Quote' ELSE 'Quote Disetujui' END`), 'StatusQuote']
                    ],
                    group: ['TOC', 'Status', 'StatusQuote'],
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
        }
        else {
            await Quote.findAll(
                {
                    where: data,
                    raw: true,
                    attributes: ['Status',
                        [db.sequelize.fn('COUNT', db.sequelize.col('Status')), 'count'],
                        [db.Sequelize.literal(`CASE WHEN Status ='0' THEN 'Quote Dibuat' 
                        WHEN Status = '2' THEN 'Quote Reject' WHEN Status='D' THEN 'Draft Quote' ELSE 'Quote Disetujui' END`), 'StatusQuote']
                    ],
                    group: ['TOC', 'Status', 'AgentID', 'StatusQuote'],
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
        }

    },
    getMotorQuote: async (data, Role, callback) => {
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        if (Role == 'M') {
            await Quote.findAll(
                {
                    where: {
                        Status: data.Status,
                        TOC: data.TOC
                    },
                    include: [
                        {
                            model: Customer,
                            attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

                        }
                    ],
                    raw: true,
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
                            return callback(error);
                        }
                    }
                    return callback(err, data);
                }).catch((error) => {
                    return callback(error);
                });
        }
        else {
            await Quote.findAll(
                {
                    where: data,
                    include: [
                        {
                            model: Customer,
                            attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

                        }
                    ],
                    raw: true,
                    attributes: ['QuotationID', 'CreateDate', 'UpdateDate', 'MainSI','IsPaid'],
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
                            return callback(error);
                        }
                    }
                    return callback(err, data);
                }).catch((error) => {
                    return callback(error);
                });
        }

    }
}