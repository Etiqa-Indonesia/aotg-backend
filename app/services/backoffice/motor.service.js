const db = require("../../models");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const Agent = db.Agent;
const Customer = db.Customer;



module.exports = {
    getMotorDashboard: async (data, callback) => {
        let where = {}
        where.TOC = data.TOC
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
                        WHEN Status = '2' THEN 'Quote Cancel' ELSE 'Quote Disetujui' END`), 'StatusQuote']
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

    },
    getMotorQuote: async (data, Role, callback) => {
        let where = {}
        where.Status = data.Status
        where.TOC = data.TOC
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        await Quote.findAll(
            {
                where: where,
                include: [
                    {
                        model: Customer ,
                        attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

                    }
                ],
                // raw: true,
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