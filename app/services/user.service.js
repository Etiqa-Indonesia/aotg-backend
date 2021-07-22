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

    getLoginUser: async (data) => {
        Agent.hasMany(User, { foreignKey: 'AgentID' });
        User.belongsTo(Agent, { foreignKey: 'AgentID' });
        Agent.belongsTo(AgentCat, { foreignKey: 'Type', targetKey: 'AgentCatID' });
        Agent.hasOne(AgentCat, { foreignKey: 'AgentCatID', sourceKey: 'Type' })

        return await User.findOne({
            where: data,
                attributes: { exclude: ['CreateDate', 'UpdateDate','LoginAttempt','SessionID'] },
                include: [{
                    model: Agent,
                    attributes: ['AgentID', 'Name', 'Type', 'Branch'
                        , 'IDNo', 'PhoneNo', 'Email', 'Company'
                        , 'NPWP', 'Bank', 'Address', 'City','AccountNo'],
                    include: [{
                        model: AgentCat,
                        attributes: { exclude: ['AgentLevel'] }

                    }]

                }
                ]
        })
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
                        , 'NPWP', 'Bank', 'Address', 'City','AccountNo'],
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
                else {
                    return callback('User atau Password salah', data[0]);
                }
                
            }).catch((error) => {
                console.log(error)
                return callback(error);
            });
    },
    forgotPassword : async (data, callback) =>{
        return await User.findOne({
            where: { EmailAddress: data,
                    isActive : 1},
        })
    },
    updateToken : async (username, token) => {
         await User.update({
            SessionID: token,
            UpdateDate: Date.now()
        }, {
            where: { UserName: username }
        })
    },
    getUserToken : async (username) => {
        return await User.findOne({
            attributes: ['SessionID', 'UserID'],
            where: { UserName: username },
        })
    },
    getLoginAttempt : async (username) => {
         return await User.findOne({
            attributes: ['LoginAttempt', 'UserID'],
            where: { UserName: username },
        })
    },
    updateAttempt : async (username, attempt) => {
        await User.update({
           LoginAttempt: attempt,
           UpdateDate: Date.now()
       }, {
           where: { UserName: username }
       })
   },
    logoutUser : async (token) => {
         await User.update(
            { SessionID: null },
            { where: { SessionID: token } }
        )
    },
    updateUser: async (data, callback) => {
        await User.update({
            Password: data.Password,
            UpdateDate: Date.now()

        }, {
            where: {
                EmailAddress: data.EmailAddress
            }
        })
    },
    updateLoginAttempt: async (username, attempt) => {
        await User.update({
            LoginAttempt: attempt,
            UpdateDate: Date.now()

        }, {
            where: {
                UserName: username
            }
        })
    },
    nonActiveUser: async (username) => {
        console.log('masuk sini')
        await User.update({
            isLockOut: 1,
            UpdateDate: Date.now()

        }, {
            where: {
                UserName: username
            }
        })
    }
};