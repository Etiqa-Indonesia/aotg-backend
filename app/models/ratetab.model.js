module.exports = (sequelize, Sequelize) => {
    const RateTab = sequelize.define("RateTab", {
        RateCode: {
            type: Sequelize.STRING(10),
            primaryKey: true
        },
        RateDesc: {
            type: Sequelize.STRING(100)
        }

    });
    return RateTab;
}