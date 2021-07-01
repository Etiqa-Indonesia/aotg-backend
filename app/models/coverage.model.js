module.exports = (sequelize, Sequelize) => {
    const Coverage = sequelize.define("Coverage", {
        QuotationID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        RateCode: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        IsMain: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        RateType: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        SumInsured: {
            allowNull: true,
            type: Sequelize.STRING(100)
        },
        Rate: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        Premium: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        DiscPCT: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        DiscAmount: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        AdminFee: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        CoverageDetail: {
            allowNull: true,
            type: Sequelize.STRING(150)
        }

    });

    return Coverage;
}