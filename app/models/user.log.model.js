module.exports = (sequelize, Sequelize) => {
    const UserLog = sequelize.define("UserLog", {
        UserLogID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        UserID: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        LoginDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        LogoutDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        isTimeOut: {
            allowNull: true,
            type: Sequelize.INTEGER
        }

    });

    return UserLog;
}