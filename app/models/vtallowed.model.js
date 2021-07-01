module.exports = (sequelize, Sequelize) => {
    const VTAllowed = sequelize.define("VTAllowed", {
        VTID: {
            type: Sequelize.STRING(6),
            primaryKey: true
        },
        AgentCatID: {
            type: Sequelize.STRING(1)
        },
        MaxAge: {
            type: Sequelize.INTEGER
        }

    });
    return VTAllowed;
}