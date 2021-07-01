module.exports = (sequelize, Sequelize) => {
    const QuoLog = sequelize.define("QuoLog", {
        QuoLogID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        QuotationID: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        UserID: {
            allowNull: true,
            type: Sequelize.STRING
        },
        Status: {
            allowNull: true,
            type: Sequelize.STRING
        },
        Remarks: {
            allowNull: true,
            type: Sequelize.STRING
        },
        CreateDate: {
            allowNull: true,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }

    });

    return QuoLog;
}