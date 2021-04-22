const db = require("../models");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const Agent = db.Agent;

module.exports = {
    getMotorDashboard: async (data, role, callback) => {
        if (role == 'M') { //Role for Approve Quote
            await Quote.findAll(
                {
                    raw: true,
                    attributes: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Status')), 'count'],
                        [db.Sequelize.literal(`CASE WHEN Status ='0' THEN 'NEW' 
                        WHEN Status = '2' THEN 'CANCELLED' ELSE 'IN PROGRESS' END`), 'StatusQuo'],
                    ],
                    group: ['TOC', 'Status', 'AgentID', 'StatusQuo'],
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
                    attributes: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Status')), 'count'],
                        [db.Sequelize.literal(`CASE WHEN Status ='0' THEN 'NEW' 
                        WHEN Status = '2' THEN 'CANCELLED' ELSE 'IN PROGRESS' END`), 'StatusQuo'],
                    ],
                    group: ['TOC', 'Status', 'AgentID', 'StatusQuo'],
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
        if (Role == 'M') {
            await Quote.findAll(
                {
                    where: {
                        Status: data.Status,
                        TOC: data.TOC
                    },
                    raw: true,
                    attributes: ['QuotationID', 'CreateDate', 'UpdateDate', 'MainSI']

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
                    attributes: ['QuotationID', 'CreateDate', 'UpdateDate', 'MainSI']

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