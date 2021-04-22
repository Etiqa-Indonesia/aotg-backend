module.exports = (sequelize, Sequelize) => {
    const Quotation = sequelize.define("Quotation", {
        QuotationID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CustomerID: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        AgentID: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        CreateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        UpdateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        TOC: {
            allowNull: true,
            type: Sequelize.STRING(5)
        },
        Topro: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        Region: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        StartDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        EndDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        MainSI: {
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
        PolicyCost: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        StampDuty: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        Status: {
            allowNull: true,
            type: Sequelize.STRING(1)
        },
        PolicyNo: {
            allowNull: true,
            type: Sequelize.STRING(20)
        },
        ANO: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        IsSubmittedCare: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        RefferenceNumber: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        EfilePath: {
            allowNull: true,
            type: Sequelize.STRING(500)
        },
        MailSent: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        MailFetchTries: {
            allowNull: true,
            type: Sequelize.INTEGER
        },
        CarePolicyID: {
            allowNull: true,
            type: Sequelize.INTEGER
        }

    });

    return Quotation;
}