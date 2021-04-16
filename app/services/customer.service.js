const db = require("../models");
const Customer = db.Customer;
const Op = db.Sequelize.Op;


module.exports = {
    getListCustomer: async (data, callback) => {
      await  Customer.findAll(
            { 
            where: {
                CustomerName: {
                        [Op.like]: '%' + data.CustomerName + '%'
                    },
                    AgentID : data.AgentID
                },
              raw : true ,
              attributes: {exclude: ['CreateDate','UpdateDate']},
              order: [
                  ['CustomerName', 'ASC']
                ]
             })
            .then((data) => {
                if (data != null) {
                    try {
                        return callback(null,data);
                    } 
                    catch (error) {
                        return callback(error);
                    }
                }
                return callback(err,data);
            }).catch((error) => {
                return callback(error);
            });
    }
}