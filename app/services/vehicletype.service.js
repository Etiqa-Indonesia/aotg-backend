const db = require("../models");
const AgentCat = db.AgentCat;
const VehicleType = db.VehicleType;
const VTAllowed = db.VTAllowed;
const { truckType, limitYearTruck } = require('../config/db.config')
const { findAllDependenciesAgentCategory } = require('../services/backoffice/agentcat.service')

const d = new Date();
let year = d.getFullYear();
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
        let TruckAllowed = true
        var results = {}
        let YearofTruck = year - data.year

        const ListAgenCat = await findAllVehicleTypeAssociate(data.AgentCatID)
        for (let index = 0; index < ListAgenCat.length; index++) {
            AllVTAllowed.push(ListAgenCat[index].VehicleType.VTName.toLowerCase())

        }
        if (AllVTAllowed.indexOf(data.Type.toLowerCase()) !== -1) {
            if (truckType.indexOf(data.Type.toLowerCase()) !== -1) {

                if (YearofTruck > limitYearTruck) {
                    
                    TruckAllowed = false
                }
            }
            if (!TruckAllowed) {
                console.log('Masuk false')
                results = {
                    allowed: false,
                    description: 'Pilihan Type ' + data.Type +' tidak boleh lebih dari ' +limitYearTruck + ' tahun',
                    id: data.id
                }
            }
            else {
                console.log('Masuk true')
                results = {
                    allowed: true,
                    description: data.Type,
                    id: data.id
                }
            }

            return results
        }
        else {
            const results = {
                allowed: false,
                description: data.Type,
                id: data.id
            }
            return results
        }


    }
}


