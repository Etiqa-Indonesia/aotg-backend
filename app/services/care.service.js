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
    },
    RetrieveFile: async (data, callback) => {
        await mw.eFIle(data)
        .then((data) => {
            return callback(null, data)

        }).catch((error) => {
            return callback(error);
        });
    },
    RetrieveANO: async (data) => {
        await mw.GetAno(data)
        .then((data) => {
            return callback(null, data)

        }).catch((error) => {
            return callback(error);
        });
    }
}