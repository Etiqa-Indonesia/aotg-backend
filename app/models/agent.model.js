module.exports = (sequelize, Sequelize) => {
    const Agent = sequelize.define("Agent", {
        AgentID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Name: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        ProfileID: {
            allowNull: false,
            type: Sequelize.STRING(50)
        },
        Type: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        Branch: {
            allowNull: true,
            type: Sequelize.STRING(30)
        },
        IDType: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        IDNo: {
            allowNull: true,
            type: Sequelize.STRING(100)
        },
        PhoneNo: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        Email: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Company: {
            allowNull: true,
            type: Sequelize.STRING(100)
        },
        NPWP: {
            allowNull: true,
            type: Sequelize.STRING(25)
        },
        Bank: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        AccountNo: {
            allowNull: true,
            type: Sequelize.STRING(25)
        },
        Address: {
            allowNull: true,
            type: Sequelize.STRING(255)
        },
        City: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Status: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        JoinedDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        TerminatedDate: {
            allowNull: true,
            type: Sequelize.DATE
        }

    });

    return Agent;
}