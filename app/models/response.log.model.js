module.exports = (sequelize, Sequelize) => {
    const ResponseLog = sequelize.define("ResponseLog", {
        LogID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        QuotationID: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        CreateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        URL: {
            allowNull: true,
            type: Sequelize.STRING(500)
        },
        isError: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        Param: {
            allowNull: true,
            type: Sequelize.STRING(1000)
        },
        StatusCode: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        Response: {
            allowNull: true,
            type: Sequelize.STRING(1000)
        }

    });

    return ResponseLog;
}