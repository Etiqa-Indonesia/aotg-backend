const db = require("../models");
const User = db.User;
const Agent = db.Agent;
const Quote = db.Quotation;
const UserLog = db.UserLog;
const Op = db.Sequelize.Op;


var IDType = {"KTP": "1", "Passport": "2"}
module.exports = {
    createUser: async (data, callback) => {
        await User.create(data)
            .then((res) => {
                return callback(null, "Sukses Create User " + data.UserName)

            }).catch((err) => {
                return callback(err);
            });
    },
    updateUser: async (data, callback) => {
        await User.update({
            UserName: data.UserName,
            Role: data.Role,
            isActive: data.isActive,
            ExpiryDate: data.ExpiryDate,
            TerminateDate: data.TerminateDate,
            UpdateDate: Date.now()

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
    updateAgent: async (data, callback) => {
        await Agent.update({
            Name: data.Name,
            ProfileID: data.ProfileID,
            Branch: data.Branch,
            IDType: IDType[data.Type],
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
    findDetailAgent : async(data) =>{
        return await Agent.findOne(
            {
                where: { AgentID: data}
            }
        )
    }
}