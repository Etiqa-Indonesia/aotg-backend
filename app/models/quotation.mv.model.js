module.exports = (sequelize, Sequelize) => {
    const QuoDetailMV = sequelize.define("QuoDetailMV", {
        QuotationID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        Brand: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Model: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Type: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Function: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        LicenseNo: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        EngineNo: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        LicenseNo: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        ChassisNo: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        Year: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        FrontView: {
            allowNull: true,
            type: Sequelize.STRING(250)
        },
        LeftView: {
            allowNull: true,
            type: Sequelize.STRING(250)
        },
        RightView: {
            allowNull: true,
            type: Sequelize.STRING(250)
        },
        BackView: {
            allowNull: true,
            type: Sequelize.STRING(250)
        },
        InsideView: {
            allowNull: true,
            type: Sequelize.STRING(250)
        }        

    });

    return QuoDetailMV;
}