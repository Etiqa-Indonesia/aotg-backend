const db = require("../models");
const userLogModel = require("../models/user.log.model");
const { use } = require("../routes/motor/product");
const UserLog = db.UserLog;
const Op = db.Sequelize.Op;

module.exports = {
    createLog : async (data) =>{
        const Datalog ={
            UserID : data['dataValues'].UserID,
            LoginDate : Date.now()
        };
       await UserLog.create(Datalog)
        .then((res) => {
        }).catch((err) => {
        });
    },
    createLogBO : async (data) =>{
        const Datalog ={
            UserID : data.UserID,
            LoginDate : Date.now()
        };
       await UserLog.create(Datalog)
        .then((res) => {
        }).catch((err) => {
        });
    },
    getUserLastLogin : async (userID) => {
        return await UserLog.findOne({
            attributes: ['UserLogID'],
            where: { UserID: userID },
            // order: 'UserLogID DESC'
            order: [
                ['UserLogID', 'DESC']
            ],
        })
    },
    updateUserLogout : async (UserLogID) => {
        return await UserLog.update(
            { LogoutDate: Date.now() },
            { where: { UserLogID: UserLogID } }
        )
    }
}