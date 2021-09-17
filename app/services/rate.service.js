const db = require("../models");
const AgentCat = db.AgentCat;
const AgentTopro = db.AgentTopro;
const RateTab = db.RateTab;
const RCAllowed = db.RCAllowed;
const RateCode = db.RateTab


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
    },
    findAllRateCode : async(data) =>{
        return await RateCode.findAll(
            {
                raw :true
            }
        )
    },
    findRateCodeMaxSI : async(data) =>{
        return await RCAllowed.findAll(
            {
                where: {AgentCatID : data},
                attributes: ['RateCode','MaxSI']

            }
        )
    },
}
