const db = require("../models");
const Agent = db.Agent;


module.exports = {
    findAgentType : async(AgentID) =>{
        return await Agent.findOne(
            {
                where: { AgentID: AgentID},
                attributes:  ['Type'] 
            }
        )
    },
}