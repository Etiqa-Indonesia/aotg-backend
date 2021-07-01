const db = require("../../models");
const User = db.User;
const Agent = db.Agent;
const Quote = db.Quotation;
const UserLog = db.UserLog;
const Customer = db.Customer;
const Op = db.Sequelize.Op;
const config = require("../../config/db.config")


var IDType = { "KTP": "1", "Passport": "2" }

module.exports = {
    createUser: async (data, callback) => {
        await User.create(data)
            .then((res) => {
                return callback(null, "Sukses Create User " + data.UserName)

            }).catch((err) => {
                return callback(err);
            });
    },
    findUser: async (data) => {
        return await User.findOne(
            {
                where: { UserID: data }
            }
        )
    },
    findAgentNotInUser: async (data) => {
        return await Agent.findAll({
            where: {
                AgentID: { [Op.notIn]: data }
            },
            attributes: ['AgentID', 'Name']
        });
    },
    findUserName: async (data) => {
        return await User.findOne(
            {
                where: { UserName: data }
            }
        )
    },
    findUserMail: async (data) => {
        return await User.findOne(
            {
                where: { EmailAddress: data }
            }
        )
    },
    findUserMailUpdate: async (data) => {
        return await User.findOne(
            {
                where: {
                    EmailAddress: data.EmailAddress,
                    UserID : data.UserID

                }
            }
        )
    },
    findListAgentOnUser: async (data) => {
        return await User.findAll({
            where: {
                AgentID: {
                    [Op.ne]: null
                }
            },
            attributes: ["AgentID"]
        });
    },
    updateUser: async (data, callback) => {
        await User.update({
            isActive: data.isActive,
            ExpiryDate: data.ExpiryDate,
            TerminateDate: data.TerminateDate,
            EmailAddress: data.EmailAddress,
            isLockOut: data.isLockOut,
            UpdateDate: Date.now()

        }, {
            where: {
                UserID: data.UserID
            }
        }).then((res) => {
            if (res != null) {
                try {
                    return callback(null, data);
                }
                catch (error) {
                    return callback(error);
                }
            }
            return callback(null, data);
        }).catch((err) => {
            return callback(err);
        });
    },
    updateAgent: async (data, callback) => {
        await Agent.update({
            Name: data.Name,
            ProfileID: data.ProfileID,
            Branch: data.Branch,
            IDType: data.IDType,
            IDNo: data.IDNo,
            PhoneNo: data.PhoneNo,
            Email: data.Email,
            Company: data.Company,
            NPWP: data.NPWP,
            Bank: data.Bank,
            AccountNo: data.AccountNo,
            Address: data.Address,
            City: data.City,
            Status: data.Status,
            JoinedDate: data.JoinedDate,
            TerminatedDate: data.TerminatedDate

        }, {
            where: {
                AgentID: data.AgentID
            }
        }).then((res) => {
            if (res != null) {
                try {
                    return callback(null, data);
                }
                catch (error) {
                    return callback(error);
                }
            }
            return callback(null, data);
        }).catch((err) => {
            return callback(err);
        });
    },
    createAgent: async (data, callback) => {
        await Agent.create(data)
            .then((res) => {
                return callback(null, "Sukses Create Agent " + data.Name)

            }).catch((err) => {
                return callback(err);
            });
    },
    findAllAgent: async () => {
        return await Agent.findAll({
        })
    },
    findDetailAgent: async (data) => {
        return await Agent.findOne(
            {
                where: { AgentID: data }
            }
        )
    },
    findDetailAgentOnUser: async (data) => {
        return await User.findOne(
            {
                where: { AgentID: data }
            }
        )
    },
    findProfileIDAgent: async (data) => {
        return await Agent.findOne(
            {
                where: { ProfileID: data }
            }
        )
    },
    updateCustomer: async (data, callback) => {
        await Customer.update({
            CustomerName: data.CustomerName,
            IDType: data.IDType,
            IDNo: data.IDNo,
            Gender: data.Gender,
            BirthDate: data.BirthDate,
            Citizenship: data.Citizenship,
            Email: data.Email,
            PhoneNo: data.PhoneNo,
            Address: data.Address,
            City: data.City,
            ZipCode: data.ZipCode,
            UpdateDate: Date.now()

        }, {
            where: {
                CustomerID: data.CustomerID
            }
        }).then((res) => {
            if (res != null) {
                try {
                    return callback(null, data);
                }
                catch (error) {
                    return callback(error);
                }
            }
            return callback(null, data);
        }).catch((err) => {
            return callback(err);
        });
    },
    findAllCustomer: async () => {
        return await Customer.findAll({
            // order: db.Sequelize.literal('CustomerName')
        })
    },
    findAllUser: async () => {
        return await User.findAll({
            attributes: { exclude: ['Password', 'CreateDate', 'UpdateDate'] },
        })
    },
    findDetailCustomer: async (data) => {
        Customer.belongsTo(Agent, { foreignKey: 'AgentID' });
        return await Customer.findAll(
            {
                where: { CustomerID: data },
                attributes: { exclude: ['CreateDate', 'UpdateDate'] },
                include: [
                    { model: Agent, attributes: { exclude: ['TerminatedDate', 'JoinedDate'] } },
                ],
                // order: db.Sequelize.literal('CustomerName')
            }
        )
    },
    findDetailUser: async (data) => {
        User.belongsTo(Agent, { foreignKey: 'AgentID' });
        return await User.findAll(
            {
                where: { UserID: data },
                attributes: { exclude: ['Password'] },
                include: [
                    { model: Agent, attributes: { exclude: ['TerminatedDate', 'JoinedDate'] } },
                ],
                // order: db.Sequelize.literal('CustomerName')
            }
        )
    },
    randomUserID: async () => {
        var chars = config.charRandom;
        var length = config.lengthRandomUserID;

        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;

    }
}