module.exports = (sequelize, Sequelize) => {
    const ErrorLog = sequelize.define("ErrorLog", {
        ErrLogID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        DataLog: {
            allowNull: true,
            type: Sequelize.STRING(3000)
        },
        DateLog: {
            allowNull: true,
            type: Sequelize.DATE
        },
        APIName: {
            allowNull: true,
            type: Sequelize.STRING(250)
        }

    });

    return ErrorLog;
}