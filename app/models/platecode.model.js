module.exports = (sequelize, Sequelize) => {
    const PlateCode = sequelize.define("PlateCode", {
        PCode: {
            type: Sequelize.STRING(2),
            primaryKey: true
        },
        Province: {
            type: Sequelize.STRING(50)
        },
        Region: {
            allowNull: true,
            type: Sequelize.INTEGER
        }

    });

    return PlateCode;
}