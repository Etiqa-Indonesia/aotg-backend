const mw = require('../mw/motor/mw.motor.client')

module.exports = {
    SaveUser: async (data, callback) => {
        await mw.saveSysUser(data)
        .then((data) => {
            return callback(null, data)

        }).catch((error) => {
            return callback(error);
        });
    },
    SavePolicy: async (data, callback) => {
        await mw.savePolicy(data)
        .then((data) => {
            return callback(null, data)

        }).catch((error) => {
            return callback(error);
        });
    },
    SubmitPolicy: async (data, callback) => {
        await mw.submitPolicy(data)
        .then((data) => {
            return callback(null, data)

        }).catch((error) => {
            return callback(error);
        });
    }
}