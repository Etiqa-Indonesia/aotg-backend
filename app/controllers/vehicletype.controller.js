const {findAllVehicleTypeAllowed} = require('../services/vehicletype.service');
const {motorproductid} = require('../config/db.config')



exports.findAllVehicleTypeAllowed = async (req, res) => {
    const data = {
        AgentCatID : req.params.agentcatid,
        Type : req.params.vehicletype,
        id : req.params.id
    }
    
    const results = await findAllVehicleTypeAllowed(data);

    if (!results.allowed) {
        res.status(400).send({
            results
        })
    
    }

    res.status(200).send({
        results
    })

}