const db = require("../../models");
const AgentCategory = db.AgentCat;
const VTAllowed = db.VTAllowed
const RCAllowed = db.RCAllowed
const Op = db.Sequelize.Op;

// RCAllowed.belongsTo(AgentCategory, { foreignKey: 'AgentCatID' });
// VTAllowed.belongsTo(AgentCategory, { foreignKey: 'AgentCatID' });

AgentCategory.hasMany(VTAllowed, { foreignKey: 'AgentCatID' });
AgentCategory.hasMany(RCAllowed, { foreignKey: 'AgentCatID' });


const findAgentCat = async (data) => {
    const AgentCat = await AgentCategory.findOne({
        where: {
            AgentCatID: data
        }
    })

    return AgentCat
}

const insertBulkVTAllowed = async (data) => {
    console.log(data);
    await VTAllowed.bulkCreate(data);
}

const destroyVTAllowed = async (data) => {
    console.log(data);
    await VTAllowed.destroy(
        {
            where:
            {
                AgentCatID: data.AgentCatID
            }
        })
}

const destroyRCAllowed = async (data) => {
    await RCAllowed.destroy(
        {
            where:
            {
                AgentCatID: data.AgentCatID
            }
        })
}

const insertBulkRCAllowed = async (data) => {
    await RCAllowed.bulkCreate(data);
}


module.exports = {
    findAllAgentCategory: async () => {
        return await AgentCategory.findAll({
            // order: db.Sequelize.literal('CustomerName')
        })
    },
    findAgentCategory: (data) => {

    },
    findAllDependenciesAgentCategory: async (data) => {
        return await AgentCategory.findAll({
            include: [{ model: RCAllowed }, { model: VTAllowed }],
            where: {
                AgentCatID: data
            }

        })
    },
    submitAgentDependencies: async (data, AgentCatID) => {
        const checkagentcat = await findAgentCat(data.AgentCatID)
        var AllVTAllowed = [];
        var AllRCAllowed = [];
        for (let index = 0; index < data.VTID.length; index++) {
            const VTIDObject = {
                VTID: data.VTID[index],
                AgentCatID: data.AgentCatID
            }
            AllVTAllowed.push(VTIDObject);
        }

        for (let index = 0; index < data.RateDetails.length; index++) {
            // console.log(data.RateDetails[index]["RateCode"])
            const RateCodeObject = {
                RateCode: data.RateDetails[index]["RateCode"],
                MaxSI: data.RateDetails[index]["MaxSI"],
                AgentCatID: data.AgentCatID
            }
            AllRCAllowed.push(RateCodeObject);
        }
        if (checkagentcat) {
            await AgentCategory.update({
                AgentCatID: data.AgentCatID,
                AgentCatName: data.AgentCatName,
                AgentLevel: data.AgentLevel

            }, {
                where: {
                    AgentCatID: data.AgentCatID
                }
            })
        }
        else {
            await AgentCategory.create({
                AgentCatID: data.AgentCatID,
                AgentCatName: data.AgentCatName,
                AgentLevel: data.AgentLevel

            })
        }
        console.log(AllRCAllowed)
        

        await destroyRCAllowed(data);
        await destroyVTAllowed(data);
        await insertBulkRCAllowed(AllRCAllowed);
        await insertBulkVTAllowed(AllVTAllowed);
        // RCAllowed.destroy(
        //     {
        //         where:
        //         {
        //             AgentCatID: data.AgentCatID
        //         }
        //     })
        // VTAllowed.destroy(
        //     {
        //         where:
        //         {
        //             AgentCatID: data.AgentCatID
        //         }
        //     })


        // VTAllowed.bulkCreate(AllVTAllowed);
        // RCAllowed.bulkCreate(AllRCAllowed);


    },
}