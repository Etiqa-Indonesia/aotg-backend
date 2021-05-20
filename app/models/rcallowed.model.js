module.exports = (sequelize, Sequelize) => {
    const RCAllowed = sequelize.define("RCAllowed", {
        RateCode: {
            type: Sequelize.STRING(10),
            primaryKey: true
        },
        AgentCatID: {
            type: Sequelize.STRING(1)
        }

    });
    return RCAllowed;
}