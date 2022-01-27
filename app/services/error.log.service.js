const db = require("../models");
const ErrorLog = db.ErrorLog;

module.exports = {
    insertLog : async (data) =>{
        console.log(data)
       await ErrorLog.create(data)
        .then((res) => {
        }).catch((err) => {
            console.log(err)
        });
    }
}