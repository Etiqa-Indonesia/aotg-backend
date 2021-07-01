const db = require("../models");
const AgentCat = db.AgentCat;
const VehicleType = db.VehicleType;
const VTAllowed = db.VTAllowed;
const { findAllDependenciesAgentCategory } = require('../services/backoffice/agentcat.service')

// VehicleType.hasMany(VTAllowed, { foreignKey: 'VTID' });
VTAllowed.hasOne(VehicleType, { foreignKey: 'VTID' });

const findAllVehicleTypeAssociate = async (data) => {
    const ListVehicleTypeAllowed = await VTAllowed.findAll({
        include: [
            {
                model: VehicleType,
                attributes: ["VTName"]
            }
        ],
        where: {
            AgentCatID: data
        }
    })

    return ListVehicleTypeAllowed
}

module.exports = {
    findAllVehicleType: async (data) => {
        return await VehicleType.findAll(
            {
                raw: true
            }
        )
    },
    findAllVehicleTypeAllowed: async (data) => {
        const AllVTAllowed = []

        const ListAgenCat = await findAllVehicleTypeAssociate(data.AgentCatID)
        for (let index = 0; index < ListAgenCat.length; index++) {
            AllVTAllowed.push(ListAgenCat[index].VehicleType.VTName.toLowerCase())
        }

        var stricmp = AllVTAllowed.toString().toLowerCase();

        if (AllVTAllowed.indexOf(data.Type.toLowerCase()) !== -1) {

            const results = {
                allowed : true,
                description: data.Type,
                id : data.id
            }
            return results
        }
        else {
            const results = {
                allowed : false,
                description: data.Type,
                id : data.id
            }
            return results
        }
        

    }
}


