const db = require("../../models");
const User = db.User;
const Op = db.Sequelize.Op;
const { genSaltSync, hashSync } = require("bcrypt");
const { createUser, createAgent, updateUser, updateAgent,
    findAllAgent, findDetailAgent, updateCustomer, findDetailCustomer, findAllCustomer } = require("../../services/backoffice/user.service")
const { createResponseLog } = require("../../services/responselog.service");
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require("path");
const DIRHTML = path.join(__dirname, '../../mail/usermail.html');
const config = require('../../config/db.config')

const DataLog = {
    QuotationID: null,
    URL: null,
    isError: null,
    Param: null,
    StatusCode: null,
    Response: null
};

const readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

var transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secure: false,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
});

var IDTypeDesc = { "1": "KTP", "2": "Passport" }
const SaveCareLog = (ResponseCareUser, StatusCode, ID, ParamSend, Config) => {
    DataLog.QuotationID = ID;
    DataLog.URL = Config;
    DataLog.isError = StatusCode == '200' ? 0 : 1;
    DataLog.Param = JSON.stringify(ParamSend);
    DataLog.StatusCode = StatusCode;
    DataLog.Response = ResponseCareUser

    createResponseLog(DataLog);
}


exports.createUser = async (req, res) => {
    // Validate request
    if (!req.body.UserName) {
        res.status(400).send({
            message: "UserName harus diisi"
        });
        return;
    }

    // Create a Post
    const salt = genSaltSync(10);
    let HasPassword = hashSync(req.body.Password, salt);
    const post = {
        UserID: req.body.UserID,
        UserName: req.body.UserName,
        AgentID: req.body.AgentID,
        Password: HasPassword,
        Role: req.body.Role,
        isActive: 1,
        ExpiryDate: req.body.ExpiryDate,
        TerminateDate: req.body.TerminateDate,
        isLockOut: req.body.isLockOut
    };
    const AgentDetail = await findDetailAgent(req.body.AgentID);
    createUser(post, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Create User', 400, null, post, 'CreateUser')
            return res.json({
                success: 0,
                message: "Gagal Create User",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Create User', 200, null, post, 'CreateUser')
            
            console.log(AgentDetail)
            readHTMLFile(DIRHTML, function (err, html) {
                var template = handlebars.compile(html);
                var replacements = {
                    UserName: post.UserName,
                    Password: req.body.Password,
                    CreateOrUpdate : 'dibuat'
                };
                var htmlToSend = template(replacements);
                var mailOptions = {
                    from: config.mailUser,
                    to: AgentDetail.Email,
                    subject: 'Akun Agent On The Go',
                    html: htmlToSend
                };
                const MailInfo = 'Email sent to: ' + AgentDetail.Email + 'For Create User Login';

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        //console.log(error)
                    } else {
                        SaveCareLog(MailInfo, '200', null, AgentDetail.Email, 'SendEmail');
                        return (console.log('Email sent to: ' + AgentDetail.Email));
                    }
                });

            });
            res.status(200).send({
                success: 1,
                message: "Sukses Create User",
                data: results
            })
        }

    });
};

exports.updateUser = (req, res) => {
    // Validate request
    if (!req.body.AgentID) {
        res.status(400).send({
            message: "AgentID harus diisi"
        });
        return;
    }
    // Save Post in the database
    updateUser(req.body, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Update User', 400, null, req.body, 'UpdateUser')
            return res.json({
                success: 0,
                message: "Gagal Update User",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Update User', 200, null, req.body, 'UpdateUser')
            res.status(200).send({
                success: 1,
                message: "Sukses Update User",
                data: results
            })
        }

    });
};

exports.updateCustomer = (req, res) => {
    // Validate request
    if (!req.body.CustomerID) {
        res.status(400).send({
            message: "CustomerID harus diisi"
        });
        return;
    }
    // Save Post in the database
    updateCustomer(req.body, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Update Customer', 400, null, req.body, 'UpdateCustomer')
            return res.json({
                success: 0,
                message: "Gagal Update Customer",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Update Customer', 200, null, req.body, 'UpdateCustomer')
            res.status(200).send({
                success: 1,
                message: "Sukses Update Customer",
                data: results
            })
        }

    });
};

exports.updateAgent = (req, res) => {
    // Validate request
    if (!req.body.AgentID) {
        res.status(400).send({
            message: "AgentID harus diisi"
        });
        return;
    }
    // Save Post in the database
    updateAgent(req.body, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Update Agent', 400, null, req.body, 'UpdateAgent')
            return res.json({
                success: 0,
                message: "Gagal Update Agent",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Update Agent', 200, null, req.body, 'UpdateAgent')
            res.status(200).send({
                success: 1,
                message: "Sukses Update Agent",
                data: results
            })
        }

    });
};

exports.createAgent = (req, res) => {
    // Validate request
    if (!req.body.Name) {
        res.status(400).send({
            message: "UserName harus diisi"
        });
        return;
    }

    var IDType = { "KTP": "1", "Passport": "2" }

    // Create a Post
    const post = {
        Name: req.body.Name,
        IDType: IDType[req.body.IDType],
        Branch: req.body.Branch,
        ProfileID: req.body.ProfileID,
        IDNo: req.body.IDNo,
        PhoneNo: req.body.PhoneNo,
        Email: req.body.Email,
        Company: req.body.Company,
        NPWP: req.body.NPWP,
        Bank: req.body.Bank,
        AccountNo: req.body.AccountNo,
        Address: req.body.Address,
        City: req.body.City,
        Status: "1",
        JoinedDate: req.body.JoinedDate,
        Type: "1",
        Address: req.body.Address
    };

    // Save Post in the database
    createAgent(post, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Create Agent', 400, null, post, 'CreateAgent')
            return res.json({
                success: 0,
                message: "Gagal Create Agent",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Create Agent', 200, null, post, 'CreateAgent')
            res.status(200).send({
                success: 1,
                message: "Sukses Create Agent",
                data: results
            })
        }

    });
};

exports.findAllAgent = async (req, res) => {
    try {
        const AgentList = await findAllAgent();

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': AgentList
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};
exports.findAllCustomer = async (req, res) => {
    try {
        const CustomerList = await findAllCustomer();

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': CustomerList
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};
exports.findDetailAgent = async (req, res) => {
    try {
        if (!req.body.AgentID) {
            res.status(400).send({
                message: "AgentID harus diisi"
            });
            return;
        }
        const AgentDetail = await findDetailAgent(req.body.AgentID);
        AgentDetail.IDType = IDTypeDesc[AgentDetail.IDType];

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': AgentDetail
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};
exports.findDetailCustomer = async (req, res) => {
    try {
        if (!req.body.CustomerID) {
            res.status(400).send({
                message: "Customer ID harus diisi"
            });
            return;
        }
        const CustomerDetail = await findDetailCustomer(req.body.CustomerID);

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': CustomerDetail
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};