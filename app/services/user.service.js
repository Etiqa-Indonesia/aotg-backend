const { sequelize, Sequelize } = require("../models");
const db = require("../models");
const User = db.User;
const Agent = db.Agent;
const AgentCat = db.AgentCat;
const Quote = db.Quotation;
const UserLog = db.UserLog;
const Op = db.Sequelize.Op;
const { createLog } = require("../services/userlog.service")

module.exports = {
    createUser: async (data, callback) => {

        await User.create(data)
            .then((res) => {
                return callback(null, "Sukses Create User " + data.UserName)

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

    getUserByPK: async (id, callback) => {
        await User.findByPk(id)
            .then((data) => {
                data.Password = undefined;
                return callback(null, data)
            }).catch((err) => {
                return callback(err);
            });

    },

    getLoginUser: (data, callback) => {
        User.findAll(
            {
                where: data,
                raw: true
            })
            .then((data) => {
                if (data[0] != null) {
                    try {
                        return callback(null, data[0]);
                    }
                    catch (error) {
                        return callback(error);
                    }
                }
                return callback(err, data[0]);
            }).catch((error) => {
                return callback(error);
            });
    },

    getLoginUserJoin: async (data, callback) => {
        Agent.hasMany(User, { foreignKey: 'AgentID' });
        User.belongsTo(Agent, { foreignKey: 'AgentID' });
        Agent.belongsTo(AgentCat, { foreignKey: 'Type', targetKey: 'AgentCatID' });
        // AgentCat.hasMany(Agent, {foreignKey: 'AgentCatID', targetKey: 'Type'});
        Agent.hasOne(AgentCat, { foreignKey: 'AgentCatID', sourceKey: 'Type' })
        await User.findAll(
            {
                where: data,
                attributes: { exclude: ['CreateDate', 'UpdateDate'] },
                include: [{
                    model: Agent,
                    attributes: ['AgentID', 'Name', 'Type', 'Branch'
                        , 'IDNo', 'PhoneNo', 'Email', 'Company'
                        , 'NPWP', 'Bank', 'Address', 'City'],
                    include: [{
                        model: AgentCat,
                        attributes: { exclude: ['AgentLevel'] }

                    }]

                }
                ]
            })
            .then((data) => {
                if (data[0] != null) {
                    try {
                        createLog(data[0]);
                        return callback(null, data[0]);
                    }
                    catch (error) {
                        console.log(error)
                        return callback(error);
                    }
                }
                return callback(err, data[0]);
            }).catch((error) => {
                console.log(error)
                return callback(error);
            });
    }
};