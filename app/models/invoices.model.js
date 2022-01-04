module.exports = (sequelize, Sequelize) => {
    const Invoices = sequelize.define("Invoices", {
        ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        QuotationID: {
            type: Sequelize.INTEGER
        },
        Amount: {
            allowNull: true,
            type: Sequelize.FLOAT()
        },
        OrderID: {
            allowNull: true,
            type: Sequelize.STRING(250)
        },
        Status: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        Currency: {
            allowNull: true,
            type: Sequelize.STRING(10)
        },
        PaymentType: {
            allowNull: true,
            type: Sequelize.STRING(100)
        },
        PaymentToken: {
            allowNull: true,
            type: Sequelize.STRING(1000)
        },
        PaymentRedirectURL: {
            allowNull: true,
            type: Sequelize.STRING(500)
        },
        PaymentTransactionID: {
            allowNull: true,
            type: Sequelize.STRING(500)
        },
        PaymentStatusCode: {
            allowNull: true,
            type: Sequelize.STRING(10)
        },
        PaymentTransactionStatus: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        PaymentSignatureKey: {
            allowNull: true,
            type: Sequelize.STRING(1000)
        },
        PaymentApprovalCode: {
            allowNull: true,
            type: Sequelize.STRING(50)
        },
        PaymentTransactionTime: {
            allowNull: true,
            type: Sequelize.DATE
        },
        PaymentSettlementTime: {
            allowNull: true,
            type: Sequelize.DATE
        },
        CreateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        UpdateDate: {
            allowNull: true,
            type: Sequelize.DATE
        },
        IsUploadARBucket: {
            allowNull: true,
            type: Sequelize.TINYINT
        },
    });

    return Invoices;
}