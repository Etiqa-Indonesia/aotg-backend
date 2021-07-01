module.exports = (sequelize, Sequelize) => {
    const VehicleType = sequelize.define("VehicleType", {
        VTID: {
            type: Sequelize.STRING(6),
            primaryKey: true
        },
        VTName: {
            type: Sequelize.STRING(50)
        }

    });
    return VehicleType;
}