const db = require("../models");
const User = db.User;
const Op = db.Sequelize.Op;
const { genSaltSync, hashSync, compare } = require("bcrypt");
const { getLoginUser, createUser, forgotPassword, updateUser,
    getUserByPK, getLoginUserJoin, createAgent } = require("../services/user.service")
const { sign } = require("jsonwebtoken");
const { SaveCareLog, PasswordPolicy } = require('../services/global.service')
const dbkey = require("../config/db.config")
const config = require("../config/db.config")
const fs = require('fs');
const path = require("path");
const DIRHTML = path.join(__dirname, '../mail/forgotpassword.html');
const DIRHTMLUPDATE = path.join(__dirname, '../mail/updatepassword.html');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

var transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secureConnection: config.mailSecure,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
});

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

const DataResetPassword = {
    EmailAddress: null,
    Password: null,
}
exports.updatePassword = async (req, res) => {
    if (!req.body.EmailAddress) {
        res.status(400).send({
            message: "Email harus diisi"
        });
        return;
    }
    const Result = await forgotPassword(req.body.EmailAddress);
    if (Result) {
        compare(req.body.PasswordOld, Result.Password, function (err, match) {
            if (err) throw new Error(err);
            else if (match == false) {
                return res.json({
                    success: 400,
                    message: 'User atau Password salah'
                })
            } else {
                const AllowedPassword = PasswordPolicy(req.body.PasswordNew)

                if (!AllowedPassword) {
                    return res.status(400).send({
                        success: 400,
                        message: "Password harus mengandung minimal 8 karakter, 1 angka, 1 huruf besar 1 huruf kecil dan 1 special character"
                    })
                }
                const salt = genSaltSync(10);
                let HasPassword = hashSync(req.body.PasswordNew, salt);

                DataResetPassword.Password = HasPassword;
                DataResetPassword.EmailAddress = req.body.EmailAddress;
                updateUser(DataResetPassword);
                readHTMLFile(DIRHTMLUPDATE, function (err, html) {
                    var template = handlebars.compile(html);
                    var replacements = {
                        UserName: Result.UserName,
                        Password: req.body.PasswordNew
                    };
                    var htmlToSend = template(replacements);
                    var mailOptions = {
                        from: config.mailUser,
                        to: req.body.EmailAddress,
                        subject: config.subjectUpdatePassword,
                        html: htmlToSend
                    };
                    const MailInfo = 'Update Password: ' + req.body.EmailAddress;
        
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            SaveCareLog(error, '400', null, req.body.EmailAddress, 'SendEmail');
                        } else {
                            SaveCareLog(MailInfo, '200', null, req.body.EmailAddress, 'SendEmail');
                            return (console.log('Email sent '));
                        }
                    });
        
                });
                return res.json({
                    success: 200,
                    message: "Sukses Update Password",
                })
            }
        });

    }
    else {
        res.status(400).send({
            success: 400,
            message: 'User dengan Email ' + req.body.EmailAddress + ' tidak tersedia atau sedang tidak aktif'
        })

    }

}
exports.forgotPassword = async (req, res) => {
    if (!req.body.EmailAddress) {
        res.status(400).send({
            message: "Email harus diisi"
        });
        return;
    }
    const Result = await forgotPassword(req.body.EmailAddress);
    console.log(Result.UserName);

    if (Result) {
        const salt = genSaltSync(10);
        let HasPassword = hashSync(config.defaultpass, salt);
        DataResetPassword.Password = HasPassword;
        DataResetPassword.EmailAddress = req.body.EmailAddress;

        await updateUser(DataResetPassword);

        readHTMLFile(DIRHTML, function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                UserName: Result.UserName
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: config.mailUser,
                to: req.body.EmailAddress,
                subject: config.subjectResetPassword,
                html: htmlToSend
            };
            const MailInfo = 'Reset Password: ' + req.body.EmailAddress;

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    SaveCareLog(error, '400', null, req.body.EmailAddress, 'SendEmail');
                } else {
                    SaveCareLog(MailInfo, '200', null, req.body.EmailAddress, 'SendEmail');
                    return (console.log('Email sent '));
                }
            });

        });
        res.status(200).send({
            success: 200,
            message: 'Reset Password Sukses silahkan cek Email Anda'
        })

    }
    else {
        res.status(400).send({
            success: 400,
            message: 'User dengan Email ' + req.body.EmailAddress + ' tidak tersedia atau sedang tidak aktif'
        })
    }
}
// Create and Save a new Post
exports.createUser = (req, res) => {
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
        isActive: 1
    };

    // Save Post in the database
    createUser(post, (err, results) => {
        if (err) {
            return res.json({
                success: 0,
                message: "Gagal Create User",
                error: err
            });
        }
        else {
            res.status(200).send({
                results
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

    // var IDType = {"KTP": "1", "Passport": "2"}

    // Create a Post
    const post = {
        Name: req.body.Name,
        IDType: config.idTYpeToDB[req.body.IDType],
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
            return res.json({
                success: 0,
                message: "Gagal Create Agent",
                error: err
            });
        }
        else {
            res.status(200).send({
                results
            })
        }

    });
};

exports.findUser = (req, res) => {
    const id = req.params.id;

    getUserByPK(id, (err, results) => {
        if (err) {
            return res.status(500).send({
                message: "Error Retrieving Data"

            });
        } else {
            res.status(200).send({
                results
            })
        }

    });
};


exports.getLogin = (req, res) => {
    const UserName = req.body.UserName;
    const password = req.body.Password;
    let condition = {
        UserName: UserName,
        IsActive: 1
    }

    getLoginUserJoin(condition, (err, results) => {
        if (err) {
            console.log('test')
            return res.status(400).send({
                success: false,
                message: err
            });
        }
        else {
            compare(password, results.Password, function (err, match) {
                if (err) throw new Error(err);
                else if (match == false) {
                    return res.status(400).send({
                        success: false,
                        message: 'User atau Password salah'
                    })
                } else {
                    // const result = null;
                    results.Password = undefined;
                    const toToken = results.AgentID + results.UserID;

                    const jsontoken = sign({ toToken }, dbkey.key, {
                        expiresIn: "2h"
                    });
                    return res.json({
                        success: true,
                        message: "Sukses Login",
                        user: results,
                        token: jsontoken
                    })
                }
            });
        }


    });
};