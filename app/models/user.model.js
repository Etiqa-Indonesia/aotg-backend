module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("ListUser", {
        UserID: {
            type: Sequelize.STRING(20),
            primaryKey: true
        },
        AgentID: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        UserName: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Password: {
            allowNull: true,
            type: Sequelize.STRING(250)
        },
        Role: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        CreateDate: {
            allowNull: true,
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        UpdateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        isActive: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        ExpiryDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        TerminateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        isLockOut: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        EmailAddress: {
            allowNull: true,
            type: Sequelize.STRING
        },
        SessionID: {
            allowNull: true,
            type: Sequelize.STRING
        },
        LoginAttempt: {
            allowNull: true,
            type: Sequelize.INTEGER
        }

    });

    return User;
}