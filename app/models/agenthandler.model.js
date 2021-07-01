module.exports = (sequelize, Sequelize) => {
    const AgentHandler = sequelize.define("AgentHandler", {
        AgentID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        UserID: {
            type: Sequelize.STRING(20)
        },
        isActive: {
            allowNull: true,
            type: Sequelize.STRING(1)
        }

    });

    return AgentHandler;
}