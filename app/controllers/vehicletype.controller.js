const { findAllVehicleTypeAllowed } = require('../services/vehicletype.service');
const { truckType } = require('../config/db.config')



exports.findAllVehicleTypeAllowed = async (req, res) => {
    const data = {
        AgentCatID: req.params.agentcatid,
        Type: req.params.vehicletype,
        id: req.params.id,
        year: req.params.year
    }
    const results = await findAllVehicleTypeAllowed(data);

    if (!results.allowed) {
        res.status(400).send({
            results
        })

    }
    else {
        res.status(200).send({
            results
        })
    }



}