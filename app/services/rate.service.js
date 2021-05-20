const db = require("../models");
const AgentCat = db.AgentCat;
const AgentTopro = db.AgentTopro;
const RateTab = db.RateTab;
const RCAllowed = db.RCAllowed;


module.exports = { 
    findTopro : async(data) =>{
        return await AgentTopro.findAll(
            {
                where: { AgentCatID: data},
                raw :true
            }
        )
    },
    findRateCode : async(data) =>{
        RCAllowed.belongsTo(RateTab, { foreignKey: 'RateCode' });
        return await RCAllowed.findAll(
            {
                where: {AgentCatID : data},
                raw : true,
                // include: [
                //     {
                //         model: RateTab ,
                //         attributes: { exclude: ['RateCode'] }

                //     }
                // ],
                attributes: ['RateCode']

            }
        )
    }
}
