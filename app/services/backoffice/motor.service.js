const db = require("../../models");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const Agent = db.Agent;
const Customer = db.Customer;



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
    getMotorQuote: async (data, Role, page,CustomerName, callback) => {
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
                        attributes: { exclude: [ 'CreateDate', 'UpdateDate'] },
                        where: {
                            CustomerName : { [Op.like]: `%${CustomerName}%` }
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
    }
}