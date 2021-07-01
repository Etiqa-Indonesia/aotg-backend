const db = require("../models");
const PlateCode = db.PlateCode;


module.exports = { 
    findPlateCode : async(data) =>{
        return await PlateCode.findOne(
            {
                where: {PCode : data}

            }
        )
    }
}
