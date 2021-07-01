const db = require("../models");
const AgentHandler = db.AgentHandler;
const Op = db.Sequelize.Op;
const User = db.User;

module.exports = {
    findMarketingEmailByAgentID: async (data) => {
        AgentHandler.belongsTo(User, { foreignKey: 'UserID' });
        return await AgentHandler.findAll({
            where: { 
                AgentID: data,
                isActive : "1"
            },
            raw :true,
            include: [
                {
                    model: User,
                    attributes:  ['EmailAddress'] 

                }
            ]
        })
    }
}