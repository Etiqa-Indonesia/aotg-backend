const db = require("../models");
const ResponseLog = db.Response;


module.exports = {
    createResponseLog : async (data) => {
       await ResponseLog.create(data)
        .then((res) => {
        }).catch((err) => {

        });
    }
}