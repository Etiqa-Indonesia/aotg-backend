'use strict';
module.exports = (sequelize, Sequelize) => {
    const AgentTopro = sequelize.define("AgentTopro", {
        Topro: {
            type: Sequelize.STRING(10)
        },
        AgentCatID: {
            type: Sequelize.STRING(1),
            primaryKey: true
        },
        Description: {
            type: Sequelize.STRING(50)
        },
        ToproYearLimit: {
            type: Sequelize.STRING(1)
        },
        OrderNo: {
            type: Sequelize.INTEGER
        }

    });
    return AgentTopro;
}