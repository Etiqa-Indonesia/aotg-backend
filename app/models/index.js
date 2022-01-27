const dbConfig = require("../config/db.config.js");
const {decrypt} = require('../auth/encrypt')

const Sequelize = require("sequelize");

var USER = decrypt(dbConfig.USER)
const Password = decrypt(dbConfig.PASSWORD)
const DBName = decrypt(dbConfig.DB)
const HOST = decrypt(dbConfig.HOST)

// var USER = dbConfig.USER
// const Password = dbConfig.PASSWORD
// const DBName = dbConfig.DB
// const HOST = dbConfig.HOST

const sequelize = new Sequelize(DBName, USER, Password, {
    host: HOST,
    dialect: dbConfig.dialect,
    operatorAliases: false,
    define:{
        freezeTableName: true,
        timestamps :false
    },
    timezone: '+07:00',
    dialectOptions: {
        options: {
          useUTC: false, // for reading from database
        },
      },

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.User = require("./user.model.js")(sequelize, Sequelize);
db.Agent = require("./agent.model.js")(sequelize, Sequelize);
db.UserLog = require("./user.log.model")(sequelize, Sequelize);
db.Quotation = require("./quotation.model")(sequelize, Sequelize);
db.Customer = require("./customer.model")(sequelize, Sequelize);
db.QuotationLog = require("./quotation.log.model")(sequelize, Sequelize);
db.QuotationMV = require("./quotation.mv.model")(sequelize, Sequelize);
db.Coverage = require("./coverage.model")(sequelize, Sequelize);
db.Response = require("./response.log.model")(sequelize, Sequelize);
db.AgentCat = require("./agentcat.model")(sequelize, Sequelize);
db.AgentTopro = require("./agenttopro.model")(sequelize, Sequelize);
db.RateTab = require("./ratetab.model")(sequelize, Sequelize);
db.RCAllowed = require("./rcallowed.model")(sequelize, Sequelize);
db.AgentHandler = require("./agenthandler.model")(sequelize, Sequelize);
db.PlateCode = require("./platecode.model")(sequelize, Sequelize);

db.VehicleType = require("./vehicletype.model")(sequelize, Sequelize);
db.VTAllowed = require("./vtallowed.model")(sequelize, Sequelize);
db.Invoices = require("./invoices.model")(sequelize, Sequelize);
db.ErrorLog = require("./error.log.model")(sequelize, Sequelize);

module.exports = db;