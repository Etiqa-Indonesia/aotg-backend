const db = require("../../models");
const User = db.User;
const Op = db.Sequelize.Op;
const { genSaltSync, hashSync } = require("bcrypt");
const { createUser, findUserName, createAgent, updateUser, updateAgent, randomUserID, findUserMail,
    findAllAgent, findDetailAgent, findDetailAgentOnUser, updateCustomer, findAgentNotInUser, findListAgentOnUser,
    findUser, findDetailCustomer, findAllCustomer, findAllUser, findDetailUser, findUserMailUpdate, findProfileIDAgent } = require("../../services/backoffice/user.service")
const { createResponseLog } = require("../../services/responselog.service");
const { SendMailTest } = require("../../services/backoffice/mail.quotation.service")
const {PasswordPolicy, TrackEvent} = require('../../services/global.service')
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require("path");
const DIRHTML = path.join(__dirname, '../../mail/usermail.html');
const config = require('../../config/db.config')
const Global = require("../../services/global.service")
const {keyReturnCaptcha} = require('../../auth/token_validation')
const MWClient = require('../../mw/motor/mw.motor.client')
const SaveUser = require('../../models/care/saveuser.model')

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

exports.sendmailtest = async (req, res) => {
    SendMailTest((err, results) => {
        if (err) {
            res.status(400).send({
                success: 0,
                data: err
            })
        } else {
            res.status(200).send({
                success: 1,
                data: results
            })
        }

    });
},
    exports.createRandomID = async (req, res) => {
        const a = await randomUserID();
        //const a = '006';
        const UserExist = await findUser(a);
        if (UserExist) {
            res.status(400).send({
                status: 400,
                message: "Gagal Create UserID silahkan coba kembali"
            })
        }
        res.status(200).send({
            status: 200,
            message: "Sukses Create Random ID",
            data: a
        })

    },
    exports.createUser = async (req, res) => {
        // Validate request

        const EmailAddress = null;
        if (!req.body.UserName) {
            res.status(400).send({
                message: "UserName harus diisi"
            });
            return;
        }
        let AgentExist = null;
        const UserExist = await findUser(req.body.UserID);
        if (req.body.Role == 'A') {
            AgentExist = await findDetailAgentOnUser(req.body.AgentID);
        }
        const UserNameExist = await findUserName(req.body.UserName);
        const UserMailExist = await findUserMail(req.body.EmailAddress);
        if (UserExist) {
            res.status(400).send({
                status: 400,
                message: "UserID " + req.body.UserID + " sudah terisi, mohon gunakan UserID lain."
            });
            return;
        }
        const PasswordAllowed = PasswordPolicy(req.body.Password);
        if (!PasswordAllowed) {
            res.status(400).send({
                status: 400,
                message: "Password harus mengandung minimal 8 karakter, 1 angka, 1 huruf besar 1 huruf kecil dan 1 special character"
            });
            return;
        }
        if (AgentExist) {
            res.status(400).send({
                status: 400,
                message: "AgentID " + req.body.AgentID + " sudah terisi, mohon gunakan AgentID lain."
            });
            return;
        }
        if (UserNameExist) {
            res.status(400).send({
                status: 400,
                message: "Username " + req.body.UserName + " sudah terisi, mohon gunakan UserName lain."
            });
            return;
        }
        if (UserMailExist) {
            res.status(400).send({
                status: 400,
                message: "Email " + req.body.EmailAddress + " sudah terisi, mohon gunakan Email yang lain."
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
            isLockOut: req.body.isLockOut,
            EmailAddress: req.body.EmailAddress
        };
        //const AgentDetail = await findDetailAgent(req.body.AgentID);
        createUser(post, (err, results) => {
            if (err) {
                SaveCareLog('Gagal Create User', 400, null, post, 'CreateUser')
                return res.status(400).send({
                    success: 0,
                    message: "Gagal Create User",
                    error: err
                });
            }
            else {
                SaveCareLog('Sukses Create User', 200, null, post, 'CreateUser')

                // console.log(AgentDetail)
                readHTMLFile(DIRHTML, function (err, html) {
                    var template = handlebars.compile(html);
                    var replacements = {
                        UserName: post.UserName,
                        Password: req.body.Password,
                        CreateOrUpdate: 'dibuat'
                    };
                    var htmlToSend = template(replacements);
                    var mailOptions = {
                        from: config.mailUser,
                        to: req.body.EmailAddress,
                        subject: 'Akun Agent On The Go',
                        html: htmlToSend
                    };
                    const MailInfo = 'Email sent to: ' + req.body.EmailAddress + 'For Create User Login';

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            //console.log(error)
                        } else {
                            SaveCareLog(MailInfo, '200', null, req.body.EmailAddress, 'SendEmail');
                            return (console.log('Email sent to: ' + req.body.EmailAddress));
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

exports.updateUser = async (req, res) => {
    // Validate request
    if (req.body.Role == 'A') {
        if (!req.body.AgentID) {
            res.status(400).send({
                status: 400,
                message: "AgentID harus diisi"
            });
            return;
        }
    }
    const dataSendUpdate= {
        EmailAddress : null,
        UserID : req.body.UserID,
        isActive :req.body.isActive,
        ExpiryDate : req.body.ExpiryDate,
        TerminateDate : req.body.TerminateDate,
        isLockOut : req.body.isLockOut,
        LoginAttempt : 0
    }

   const dataCheckMail= {
        EmailAddress : req.body.EmailAddress,
        UserID : req.body.UserID
    }
    const EmailUserExist = await findUserMailUpdate(dataCheckMail);
    if (EmailUserExist) {
        dataSendUpdate.EmailAddress = req.body.EmailAddress
    }
    else {
        const EmailUserExistForUpdate = await findUserMail(req.body.EmailAddress);
        if (EmailUserExistForUpdate) {
            res.status(400).send({
                status: 400,
                message: "Email sudah digunakan User lain silahkan gunakan email lainya"
            });
            return;
        }
        else{
            dataSendUpdate.EmailAddress = req.body.EmailAddress
        }

    }

    

    // Save Post in the database
    updateUser(dataSendUpdate, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Update User', 400, null, req.body, 'UpdateUser')
            return res.status(400).send({
                status: 400,
                message: "Gagal Update User",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Update User', 200, null, req.body, 'UpdateUser')
            res.status(200).send({
                status: 200,
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
            status: 400,
            message: "CustomerID harus diisi"
        });
        return;
    }
    // Save Post in the database
    updateCustomer(req.body, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Update Customer', 400, null, req.body, 'UpdateCustomer')
            return res.json({
                status: 400,
                message: "Gagal Update Customer",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Update Customer', 200, null, req.body, 'UpdateCustomer')
            res.status(200).send({
                status: 200,
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
            status: 400,
            message: "AgentID harus diisi"
        });
        return;
    }
    // Save Post in the database
    updateAgent(req.body, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Update Agent', 400, null, req.body, 'UpdateAgent')
            return res.json({
                status: 400,
                message: "Gagal Update Agent",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Update Agent', 200, null, req.body, 'UpdateAgent')
            res.status(200).send({
                status: 200,
                message: "Sukses Update Agent",
                data: results
            })
        }

    });
};

exports.createAgent = async (req, res) => {
    // Validate request
    if (!req.body.Name) {
        res.status(400).send({
            status: 400,
            message: "UserName harus diisi"
        });
        return;
    }

    const ProfileIDExist = await findProfileIDAgent(req.body.ProfileID);

    if (ProfileIDExist) {
        res.status(400).send({
            status: 400,
            message: "Profile " + req.body.ProfileID + " sudah terisi, mohon gunakan ProfileID lain."
        });
        return;
    }

    
    const SysUserID = {
        ID : req.body.ProfileID
    }
    const CheckSysUser = await MWClient.SearchSysUser(SysUserID)
    console.log(CheckSysUser.data)
    var IDType = { "KTP": "K", "Passport": "P", "SIM": "S" }

    if (CheckSysUser.data.code == 400) {
        SaveUser.ID= req.body.ProfileID
        SaveUser.Address_1 = req.body.Address
        SaveUser.City = req.body.City
        SaveUser.Email = req.body.Email
        SaveUser.Mobile= req.body.PhoneNo
        SaveUser.ID_Name = req.body.Name
        SaveUser.ID_Type = 'KTP'
        SaveUser.ID_No= req.body.IDNo
        SaveUser.Name = req.body.Name
        await MWClient.saveSysUser(SaveUser)
    }
    

    // Create a Post
    const post = {
        Name: req.body.Name,
        IDType: req.body.IDType,
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
        Type: req.body.Type,
        Address: req.body.Address
    };

    // Save Post in the database
    createAgent(post, (err, results) => {
        if (err) {
            SaveCareLog('Gagal Create Agent', 400, null, post, 'CreateAgent')
            return res.json({
                status: 400,
                message: "Gagal Create Agent",
                error: err
            });
        }
        else {
            SaveCareLog('Sukses Create Agent', 200, null, post, 'CreateAgent')
            res.status(200).send({
                status: 200,
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
exports.findAgentNotInUser = async (req, res) => {
    try {
        const listAgentonUser = await findListAgentOnUser();
        const AgentIDs = listAgentonUser.map(agents => agents.AgentID);
        const AgentList = await findAgentNotInUser(AgentIDs);

        res.status(200).send({
            status: 200,
            'message': 'Success',
            'data': AgentList
        })
    } catch (error) {
        res.status(400).send({
            status: 400,
            'message': 'Error',
            'data': error
        })
    }
};
exports.findAllUser = async (req, res) => {
    try {
        const UserList = await findAllUser();

        res.status(200).send({
            status: 200,
            'message': 'Success',
            'data': UserList
        })
    } catch (error) {
        res.status(400).send({
            status: 400,
            'message': 'Error',
            'data': error
        })
    }
};
exports.findAllCustomer = async (req, res) => {
    try {
        const CustomerList = await findAllCustomer();

        res.status(200).send({
            status: 200,
            'message': 'Success',
            'data': CustomerList
        })
    } catch (error) {
        res.status(400).send({
            status: 400,
            'message': 'Error',
            'data': error
        })
    }
};
exports.findDetailAgent = async (req, res) => {
    try {
        if (!req.body.AgentID) {
            res.status(400).send({
                status: 400,
                message: "AgentID harus diisi"
            });
            return;
        }
        const AgentDetail = await findDetailAgent(req.body.AgentID);
        // AgentDetail.IDType = config.idTypeToResponse[AgentDetail.IDType];

        res.status(200).send({
            status: 200,
            'message': 'Success',
            'data': AgentDetail
        })
    } catch (error) {
        res.status(400).send({
            status: 400,
            'message': 'Error',
            'data': error
        })
    }
};
exports.findDetailCustomer = async (req, res) => {
    try {
        if (!req.body.CustomerID) {
            res.status(400).send({
                status: 400,
                message: "Customer ID harus diisi"
            });
            return;
        }
        const CustomerDetail = await findDetailCustomer(req.body.CustomerID);
        // CustomerDetail[0].BirthDate = Global.D(CustomerDetail[0].BirthDate)
        // console.log(test)

        res.status(200).send({
            status: 200,
            'message': 'Success',
            'data': CustomerDetail[0]
        })
    } catch (error) {
        res.status(400).send({
            status: 400,
            'message': 'Error',
            'data': error
        })
    }
};

exports.findDetailUser = async (req, res) => {
    try {
        if (!req.body.UserID) {
            res.status(400).send({
                status: 400,
                message: "UserID harus diisi"
            });
            return;
        }
        const UserDetail = await findDetailUser(req.body.UserID);
        // AgentDetail.IDType = config.idTypeToResponse[AgentDetail.IDType];

        res.status(200).send({
            status: 200,
            'message': 'Success',
            'data': UserDetail[0]
        })
    } catch (error) {
        res.status(400).send({
            status: 400,
            'message': 'Error',
            'data': error
        })
    }
};
exports.returnkeyCaptcha = async(req,res)=> {

    const returnResult = await keyReturnCaptcha(config.siteKeyCaptcha)

    res.status(200).send({
        success: 200,
        key: returnResult,
        bufferKey :config.KEY


    });

}

exports.analytics = async (req, res) => {
    try {

        const data = req.body;
        // await trackEvent('policy_generated','V000217','B4', 3010)
        
        await TrackEvent(data)
        return res.status(200).send({
            success: 200,
            message: "Sukses",
    
        })
    } catch (error) {
        console.log(error)
        return res.status(200).send({
            success: 400,
            message: error,
    
        })
    }
}