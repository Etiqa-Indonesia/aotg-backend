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
    }
}