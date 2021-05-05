const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require('helmet');
const cron = require('node-cron');
const logger = require('morgan');

// const http = require("http");

// Models
 const db = require("./app/models"); //auto call index.js

const app = express();

let whiteList = ['http://localhost:4200'];
let corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};


// var server = http.createServer(app);
app.use(cors(corsOptions));
app.use(helmet());
app.use(logger('dev'));

app.use(express.static(__dirname + '/uploads'));

try {
    db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '25mb'}));


// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '25mb'  }));

// app.use(express.limit('3M'));

// Sync database
//  db.sequelize.authenticate();
db.sequelize.sync({
    force : false , // To create table if exists , so make it false
    alter : false // To update the table if exists , so make it true
})
// db.sequelize.sync();

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Test REST API." });
});

cron.schedule('* * * * * ', () => {
    require("./app/services/cron.service")(app);
  });

cron.schedule('* * * * *', () => {
    // console.log('Jalan')
    require("./app/services/mail.service")(app);
  });

// User Routes
require("./app/routes/user.routes")(app);
require("./app/routes/mw.motor.routes")(app);
require("./app/routes/quote.motor.routes")(app);
require("./app/routes/dashboard.routes")(app);
require("./app/routes/customer.routes")(app);
require("./app/routes/backoffice/userbackoffice.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
}); 

module.exports = app