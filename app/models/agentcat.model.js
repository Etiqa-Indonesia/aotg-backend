module.exports = (sequelize, Sequelize) => {
    const AgentCat = sequelize.define("AgentCat", {
        AgentCatID: {
            type: Sequelize.STRING(1),
            primaryKey: true
        },
        AgentCatName: {
            type: Sequelize.STRING(50)
        },
        AgentLevel: {
            type: Sequelize.INTEGER
        }

    });
    return AgentCat;
}