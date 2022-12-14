const db = require("../models");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const { createCoverageDetail, createQuote, createQuoteLogBackOffice,
    createQuoteLog, createQuoteDetail, checkExistCustomer, createCustomer, updateCustomer,
    updateFrontView, updateBackView, updateLeftView, updateRightView,
    createorupdateCustomer, updateCustomerQuotation,
    getQuotebyPK, getImagebyPK, ApproveQuoteByPK, updateInsideView,
    updateQuotationforPolicy, updateQuotationforSubmitPolicy, updateQuotationforQuoteBackOffice,
    updateQuotation, updateQuoteDetail, updateCoverageDetail, rejectQuotationforBackOffice, createDraftQuotation, testCreatePDF } = require("../services/quotation.service");
const { createResponseLog } = require("../services/responselog.service");
const { findToproBasedOnYear } = require("../services/rate.service");
const { SaveUser, SavePolicy, SubmitPolicy } = require("../services/care.service");
const { SendMail, SendMailDraftQuptation, SendMailDraftQuoteUsingID } = require("../services/backoffice/mail.quotation.service");
const { findMarketingEmailByAgentID } = require('../services/agenthandler.service');
const { findPlateCode } = require('../services/platecode.service');
const { sendMail, FindToproUsed } = require('../services/global.service')
const { findAgentType, findAgentProfile } = require('../services/agent.service')
const { EIICareUser } = require('../services/global.service')
const SaveProfile = require("../models/care/saveprofile.model")

const multer = require('multer');
const path = require("path");
const fs = require('fs');
const url = require('url');
const maxSize = 4 * 1024 * 1024;
const Policy = require('../models/care/savepolicy.model');
const MwClient = require('../mw/motor/mw.motor.client');
const { User } = require("../models");
const DIRFRONT = path.join(__dirname, '../../uploads/frontview');
const DIRBACK = path.join(__dirname, '../../uploads/backview');
const DIRLEFT = path.join(__dirname, '../../uploads/leftview');
const DIRRIGHT = path.join(__dirname, '../../uploads/rightview');
const DIRINSIDE = path.join(__dirname, '../../uploads/insideview');

//Resize
const DIRLEFTR = path.join(__dirname, '../../uploads/leftviewResize/');
const DIRFRONTR = path.join(__dirname, '../../uploads/frontviewResize/');
const DIRBACKR = path.join(__dirname, '../../uploads/backviewResize/');
const DIRRIGHTR = path.join(__dirname, '../../uploads/rightviewResize/');
const DIRINSIDER = path.join(__dirname, '../../uploads/insideviewResize/');
//
const DirHTMLMailCreateQuote = path.join(__dirname, '../mail/createquotation.html');
const config = require('../config/db.config');
const sharp = require('sharp');
const dbConfig = require("../config/db.config");
const { saveSysUser } = require("../mw/motor/mw.motor.client");
// const sendmail = require("../services/test.service");



var Datenow = new Date().toLocaleString();

const d = new Date();
let year = d.getFullYear();

const DataLog = {
    QuotationID: null,
    URL: null,
    isError: null,
    Param: null,
    StatusCode: null,
    Response: null
};

const SaveCareLog = (ResponseCareUser, StatusCode, ID, ParamSend, Config) => {
    DataLog.QuotationID = ID;
    DataLog.URL = Config;
    DataLog.isError = StatusCode == '200' ? 0 : 1;
    DataLog.Param = JSON.stringify(ParamSend);
    DataLog.StatusCode = StatusCode;
    DataLog.Response = ResponseCareUser

    createResponseLog(DataLog);
}

exports.SendMailDraftQuoteUsingID = async (req, res) => {
    const QuotationID = req.body.quotationid;
    const EmailCust = req.body.email;
    const FileName = 'MotorVehicle_' + QuotationID + '_' + req.body.name + '.pdf'

    const result = await SendMailDraftQuoteUsingID(EmailCust, 'Premium Calculation Draft', FileName, QuotationID)
    console.log(result)

    if (result != 'Exist') {
        res.status(400).send({
            'code': '400',
            'message': 'Failed, File Direktori ' + FileName + ' tidak ditemukan',
        })
    }
    else {
        res.status(200).send({
            'code': '200',
            'message': 'Success, Kirim Email '
        })
    }

}

exports.getQuotebyPK = async (req, res) => {
    const datasend = {
        QuotationID: req.params.id
    };

    getQuotebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            res.status(200).send({
                results
            });
        }
    });
};

exports.findPlateCode = async (req, res) => {
    const datasend = req.params.pcode
    try {
        const PCodeList = await findPlateCode(datasend);

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': PCodeList
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }

    findPlateCode(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            res.status(200).send({
                results
            });
        }
    });
};

exports.ApproveQuote = async (req, res) => {
    const datasend = {
        QuotationID: req.params.id
    };
    const dataQuolog = {
        QuotationID: req.params.id,
        Remarks: req.body.Remarks,
        Status: req.body.Status,
        UserID: req.body.UserID
    };
    // console.log(dataQuolog);
    var urlobj = url.parse(req.originalUrl);
    urlobj.protocol = req.protocol;
    urlobj.host = req.get('host');
    var requrl = url.format(urlobj);

    ApproveQuoteByPK(datasend, async (err, results) => {
        await createQuoteLogBackOffice(dataQuolog);
        await updateQuotationforQuoteBackOffice(dataQuolog);
        if (err) {
            res.status(400).send({
                status: 400,
                message: err
            });
        }
        else {
            var ResponseCareUser = null;
            var ResponseCarePolicy = null;
            const resultsysuser = await MwClient.saveSysUser(JSON.stringify(results.UserSys))
            SaveCareLog(JSON.stringify(resultsysuser.data), resultsysuser.data.code, req.params.id, results.UserSys, config.saveUserCareURl)
            const resultuserProfile = await MwClient.saveProfile(JSON.stringify(results.UserProfile))
            SaveCareLog(JSON.stringify(resultuserProfile.data), resultuserProfile.data.code, req.params.id, results.UserProfile, config.saveProfileCareURl)
            await SavePolicy(JSON.stringify(results.PolicyData), (err, resultPolicy) => {
                if (err) {
                    const Response = "Error Cek Param yang dikirim & Save Policy gagal dilakukan";
                    const Status = 422;
                    SaveCareLog(Response, Status, req.params.id, results.PolicyData, config.savePolicyCareURL);
                }
                else {
                    ResponseCarePolicy = resultPolicy.data;
                    SaveCareLog(JSON.stringify(ResponseCarePolicy), ResponseCarePolicy.code,
                        req.params.id, results.PolicyData, config.savePolicyCareURL);
                    const paramUpdate = {
                        PolicyNo: ResponseCarePolicy.Data[0].PolicyNo,
                        RefferenceNumber: ResponseCarePolicy.Data[0].RefNo,
                        CarePolicyID: ResponseCarePolicy.Data[0].PID
                    }
                    updateQuotationforPolicy(req.params.id, paramUpdate);
                    const paramSubmitPolicy = {
                        PID: ResponseCarePolicy.Data[0].PID
                    }

                    SubmitPolicy(JSON.stringify(paramSubmitPolicy), (err, resultSubPolicy) => {
                        if (err) {
                            const Response = "Error Cek Param yang dikirim & Submit Policy gagal dilakukan";
                            const Status = 422;
                            SaveCareLog(Response, Status, req.params.id, JSON.stringify(paramSubmitPolicy), config.submitPolicyCareURL);
                        }
                        else {
                            ResponseCarePolicy = resultSubPolicy.data;
                            SaveCareLog(JSON.stringify(ResponseCarePolicy), ResponseCarePolicy.code,
                                req.params.id, paramSubmitPolicy, config.submitPolicyCareURL);
                            const paramUpdate = {
                                IsSubmittedCare: 1
                            }
                            updateQuotationforSubmitPolicy(req.params.id, paramUpdate);
                        }

                    });
                }

            });
            res.status(200).send({
                status: 200,
                message: 'Quotation berhasil di Approve, Tunggu beberapa menit hingga File Polis terkirim'
            });
        }
    });

};

exports.RejectQuote = async (req, res) => {
    var dataSend = {
        QuotationID: req.params.id,
        Remarks: req.body.Remarks,
        UserID: req.body.UserID,
        Status: config.statusReject
    }

    rejectQuotationforBackOffice(dataSend);
    createQuoteLogBackOffice(dataSend);

    res.status(200).json({
        status: 200,
        message: 'Berhasil Reject Quotation ID :' + req.params.id
    });

};

exports.testCreatePDF = async (req, res) => {
    const INFO = await testCreatePDF(req.body, 1000)

    res.status(200).json({
        status: 200,
        message: INFO
    });

};

exports.findToproBasedOnYear = async (req, res) => {

    const results = await findToproBasedOnYear(req.params.agentid, req.params.vehicleyear)

    res.status(200).json({
        status: 200,
        data: results
    });

};


exports.CreateQuote = async (req, res) => {
    var d = new Date(req.body.inception_date);
    var EndDate = d.setFullYear(d.getFullYear() + 1);
    var customerresult;
    // console.log(Datenow);
    var urlobj = url.parse(req.originalUrl);
    urlobj.protocol = req.protocol;
    urlobj.host = req.get('host');
    var requrl = url.format(urlobj);
    const AgentCheck = await findAgentProfile(req.body.agentid)

    const QuotationID = req.body.quotationid;
    const PremiumDetails = req.body.premium_details;
    const VehicleDetails = req.body.vehicle_detail;
    const Customer = req.body.customer_detail;
    const PrintData = req.body.printquotationdata;

    var KompreOrTLO = "Komprehensive"

    if (req.body.coverage_id.includes("TLO")) {
        KompreOrTLO = "TLO"
    }


    const ToproParamBasedOnYear = year - VehicleDetails.manufactured_year
    const AgentType = await findAgentType(req.body.agentid)
    var ToproIsUsed;
    //untuk type agent != R
    if (AgentType.Type !== 'R' && (ToproParamBasedOnYear > 5 || dbConfig.truckType.indexOf(PrintData.type.toLowerCase()) !== -1)) {
        const result = await FindToproUsed(PrintData.type, AgentType.Type, KompreOrTLO)
        ToproIsUsed = result.Topro
    }
    else {
        ToproIsUsed = req.body.coverage_id
    }


    const dataQuotes = {
        CustomerID: req.body.customerid,
        AgentID: req.body.agentid,
        CreateDate: Datenow,
        TOC: req.body.product_id,
        Topro: ToproIsUsed,
        Region: req.body.region_id,
        StartDate: req.body.inception_date,
        EndDate: EndDate,
        MainSI: req.body.sum_insured_1,
        SI_2: req.body.sum_insured_2,
        SI_3: req.body.sum_insured_3,
        SI_4: req.body.sum_insured_4,
        SI_5: req.body.sum_insured_5,
        Premium: req.body.total_premium, //Total Premium
        DiscPCT: req.body.discount_pct,
        DiscAmount: req.body.total_discount, //Total discount
        PolicyCost: req.body.total_payable,
        StampDuty: req.body.total_stamp_duty,
        Status: req.body.status,
        PolicyNo: req.body.policyNo,
        ANO: req.body.ANO,
        IsSubmittedCare: 0,
        MailSent: 0,
        MailFetchTries: 0,
        Remarks: req.body.remarks,
        CreateDate: Date.now()
    };



    const dataCustomer = {
        // CustomerID : null,
        CustomerName: Customer.name,
        IDType: Customer.id_type,
        IDNo: Customer.id_number,
        Gender: Customer.gender,
        BirthDate: Customer.birth_date,
        Citizenship: Customer.id_citizenship,
        Email: Customer.email,
        PhoneNo: Customer.telephone_number,
        Address: Customer.address_1,
        City: Customer.city,
        ZipCode: Customer.zipcode,
        AgentID: req.body.agentid,
        CreateDate: Date.now()
    };
    const dataVehicle = {
        QuotationID: null,
        Brand: VehicleDetails.brand,
        Model: VehicleDetails.model,
        Type: VehicleDetails.type,
        LicenseNo: VehicleDetails.license_number,
        EngineNo: VehicleDetails.engine_number,
        ChassisNo: VehicleDetails.chassis_number,
        Year: VehicleDetails.manufactured_year
    };

    DataLog.QuotationID = null
    DataLog.URL = requrl;
    DataLog.isError = 0;
    DataLog.Param = JSON.stringify(req.body);
    DataLog.StatusCode = 200;
    DataLog.Response = null
    const dataMarketing = await findMarketingEmailByAgentID(req.body.agentid)
    const listMail = []
    console.log(dataMarketing.length)


    //Mail Marketing Dinamis
    if (dataMarketing.length > 0) {
        console.log('Masuk Marketing')
        for (let i = 0; i < dataMarketing.length; i++) {
            const MailMarketing = dataMarketing[i]['ListUser.EmailAddress']
            listMail.push(MailMarketing);
        }
    }
    else
        listMail.push(config.mailMarketing) // mail marketing statis

    console.log(listMail);
    const DataSendMail = {
        Pathfile: DirHTMLMailCreateQuote,
        Email: listMail,
        QuotationID: null
    }


    if (Customer.name == undefined || dataCustomer.CustomerName == null) {
        return res.status(400).json({
            success: false,
            message: 'Nama Customer tidak boleh Kosong'
        });
    }
    if (dataCustomer.IDNo == null) {
        return res.status(400).json({
            success: false,
            message: 'ID Nomor Customer tidak boleh kosong'
        });
    }
    if (dataCustomer.IDType == null) {
        return res.status(400).json({
            success: false,
            message: 'ID Type Customer tidak boleh kosong'
        });
    }
    if (dataQuotes.Status == null) {
        return res.status(400).json({
            success: false,
            message: 'Status Quote tidak boleh kosong'
        });
    }
    if (dataCustomer.BirthDate == null || dataCustomer.BirthDate == '') {
        return res.status(400).json({
            success: false,
            message: 'Tanggal lahir Customer tidak boleh kosong'
        });
    }


    if (!PrintData && dataQuotes.Status.toLowerCase() == "d") {
        return res.status(400).json({
            success: false,
            message: 'Parameter Print Quotation Kosong'
        });
    }

    if (QuotationID != null) {
        updateQuotation(QuotationID, dataQuotes, async (err, results) => {
            if (err) {
                return res.json({
                    message: err
                });
            }
            else {
                var Info = null;

                if (dataQuotes.Status.toLowerCase() == "d") {
                    try {

                        Info = await createDraftQuotation(req.body, QuotationID);
                    } catch (error) {
                        console.log('error create pdf: ' + error)
                    }
                    try {
                        await SendMailDraftQuptation(dataCustomer.Email, 'Premium Calculation Draft', Info.outputpdf, Info.dir, QuotationID, 'Quotation Draft');
                    } catch (error) {
                        console.log(error)
                    }
                }
                createorupdateCustomer(dataCustomer, async (err, resultsC) => {
                    updateCustomerQuotation(QuotationID, resultsC);
                    customerresult = resultsC;
                    // const IDCheck = req.body.agentid + dataCustomer.IDNo + resultsC
                    // const paramCheckProfileMW = {
                    //     ID: EIICareUser('', IDCheck)
                    // }
                    // // const resultProfileMW = await MwClient.SearchProfile(paramCheckProfileMW)

                    // // if (resultProfileMW.data.code === 400) {
                    // SaveProfile.ID = EIICareUser('', IDCheck)
                    // SaveProfile.BirthDate = dataCustomer.BirthDate
                    // SaveProfile.Email = dataCustomer.Email
                    // SaveProfile.ID_Name = dataCustomer.CustomerName
                    // SaveProfile.ID_No = EIICareUser('', IDCheck)
                    // SaveProfile.ID_Type = dataCustomer.IDType
                    // SaveProfile.Name = dataCustomer.CustomerName
                    // SaveProfile.Mobile = dataCustomer.PhoneNo
                    // SaveProfile.Address_1 = dataCustomer.Address
                    // SaveProfile.Gender = dataCustomer.Gender
                    // SaveProfile.AID = AgentCheck.ProfileID

                    // //const abc = await MwClient.saveProfile(SaveProfile) //saveprofile 
                    // console.log(abc.data)
                    // // }

                });
                const DataUpdate = {
                    Message: "Update Data Quotation " + QuotationID
                }

                dataVehicle.QuotationID = QuotationID;
                DataLog.QuotationID = QuotationID;
                DataLog.Response = JSON.stringify(DataUpdate);
                DataSendMail.QuotationID = QuotationID;
                // console.log(DataLog)

                await createResponseLog(DataLog);
                await updateQuoteDetail(dataVehicle);
                const dataQuolog = {
                    QuotationID: QuotationID,
                    Remarks: "Resubmit Quote",
                    Status: dataQuotes.Status,
                    UserID: req.body.userid
                };


                await createQuoteLogBackOffice(dataQuolog);
                await updateCoverageDetail(PremiumDetails, QuotationID,
                    req.body.sum_insured_1, req.body.discount_pct);

                if (dataQuotes.Status == "0")
                    await SendMail(DataSendMail);


                res.status(200).send({
                    data: req.body
                });
            }

        });

    } else {
        createQuote(dataQuotes, async (err, results) => {
            if (err) {
                return res.json({
                    message: err
                });
            }
            else {
                try {
                    var Info = null;

                    if (dataQuotes.Status.toLowerCase() == "d") {
                        Info = await createDraftQuotation(req.body, results.QuotationID);
                        try {
                            await SendMailDraftQuptation(dataCustomer.Email, 'Premium Calculation Draft', Info.outputpdf, Info.dir, results.QuotationID, 'Quotation Draft');
                        } catch (error) {
                            console.log(error)
                        }
                        //await SendMailDraftQuptation(data.customer_detail.email, 'Premium Calculation Vehicle', outputpdf, DIRDRAFTQUOT, data, 'Send Draft Calculation Quote')
                    }
                    createorupdateCustomer(dataCustomer, async (err, resultsC) => {
                        await updateCustomerQuotation(results.QuotationID, resultsC);
                        customerresult = resultsC;

                        // const IDCheck = req.body.agentid + dataCustomer.IDNo + resultsC
                        // const paramCheckProfileMW = {
                        //     ID: EIICareUser('', IDCheck)
                        // }
                        // // const resultProfileMW = await MwClient.SearchProfile(paramCheckProfileMW)

                        // // if (resultProfileMW.data.code === 400) {
                        // SaveProfile.ID = EIICareUser('', IDCheck)
                        // SaveProfile.BirthDate = dataCustomer.BirthDate
                        // SaveProfile.Email = dataCustomer.Email
                        // SaveProfile.ID_Name = dataCustomer.CustomerName
                        // SaveProfile.ID_No = EIICareUser('', IDCheck)
                        // SaveProfile.ID_Type = dataCustomer.IDType
                        // SaveProfile.Name = dataCustomer.CustomerName
                        // SaveProfile.Mobile = dataCustomer.PhoneNo
                        // SaveProfile.Address_1 = dataCustomer.Address
                        // SaveProfile.Gender = dataCustomer.Gender
                        // SaveProfile.AID = AgentCheck.ProfileID

                        // //await MwClient.saveProfile(SaveProfile)
                        // // }

                    });
                    dataVehicle.QuotationID = results.QuotationID;
                    DataSendMail.QuotationID = results.QuotationID;
                    DataLog.QuotationID = results.QuotationID;
                    DataLog.Response = JSON.stringify(results);
                    await createResponseLog(DataLog);
                    await createQuoteDetail(dataVehicle);
                    //createQuoteLog(results);

                    const dataQuolog = {
                        QuotationID: results.QuotationID,
                        Remarks: "Create Quote",
                        Status: dataQuotes.Status,
                        UserID: req.body.userid
                    };

                    await createQuoteLogBackOffice(dataQuolog);
                    if (dataQuotes.Status == "0")
                        SendMail(DataSendMail);

                    await createCoverageDetail(PremiumDetails, results.QuotationID,
                        req.body.sum_insured_1, req.body.discount_pct);

                    await res.status(200).send({
                        results
                    });

                } catch (error) {

                }

            }

        });
    }
};

exports.uploadFrontView = (req, res) => {
    const id = req.params.id;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIRFRONT)
        },
        filename: function (req, file, cb) {
            cb(null, id + "_" + file.originalname)
        }
    })

    var upload = multer({
        storage: storage,
        limits: { fileSize: maxSize }
    }).single('frontFile');
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send({
                message: "File size cannot be larger than 4MB!",
            });
        }

        if (req.file != null || undefined) {
            const filePath = req.file.path;
            const newFilePathResize = DIRFRONTR + id + "_" + req.file.originalname
            sharp(filePath)
                .withMetadata()
                .toFile(newFilePathResize, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            updateFrontView(id, newFilePathResize);
            res.json({
                success: true,
                message: 'Image uploaded!'
            });
        } else {
            res.status(201).json({
                success: false,
                message: 'No Image uploaded!'
            });
        }
    })
};

exports.uploadBackView = (req, res) => {
    const id = req.params.id;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIRBACK)
        },
        filename: function (req, file, cb) {
            cb(null, id + "_" + file.originalname)
        }
    })

    var upload = multer({
        storage: storage,
        limits: { fileSize: maxSize }
    }).single('backFile');
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send({
                message: "File size cannot be larger than 4MB!",
            });
        }
        if (req.file != null || undefined) {
            const filePath = req.file.path;
            const newFilePathResize = DIRBACKR + id + "_" + req.file.originalname
            sharp(filePath)
                .withMetadata()
                .toFile(newFilePathResize, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            updateBackView(id, newFilePathResize);
            res.json({
                success: true,
                message: 'Image uploaded!'
            });
        } else {
            res.status(201).json({
                success: false,
                message: 'No Image uploaded!'
            });
        }
    })

};

exports.uploadLeftView = async (req, res) => {
    const id = req.params.id;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIRLEFT)
        },
        filename: function (req, file, cb) {
            cb(null, id + "_" + file.originalname)
        }
    })

    console.log(req.file)

    var upload = multer({
        storage: storage,
        limits: { fileSize: maxSize }
    }).single('leftFile');
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send({
                message: "File size cannot be larger than 4MB!",
            });
        }

        if (req.file != null || undefined) {

            const filePath = req.file.path;
            console.log(filePath)
            const newFilePathResize = DIRLEFTR + id + "_" + req.file.originalname
            sharp(filePath)
                .withMetadata()
                .toFile(newFilePathResize, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            updateLeftView(id, newFilePathResize);
            res.json({
                success: true,
                message: 'Image uploaded!'
            });
        } else {


            res.status(201).json({
                success: false,
                message: 'No Image uploaded!'
            });
        }
    })

};

exports.uploadRightView = (req, res) => {
    const id = req.params.id;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIRRIGHT)
        },
        filename: function (req, file, cb) {
            cb(null, id + "_" + file.originalname)
        }
    })

    var upload = multer({
        storage: storage,
        limits: { fileSize: maxSize }
    }).single('rightFile');
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send({
                message: "File size cannot be larger than 4MB!",
            });
        }

        if (req.file != null || undefined) {
            const filePath = req.file.path;
            const newFilePathResize = DIRRIGHTR + id + "_" + req.file.originalname
            sharp(filePath)
                .withMetadata()
                .toFile(newFilePathResize, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            updateRightView(id, newFilePathResize);
            res.json({
                success: true,
                message: 'Image uploaded!'
            });
        } else {
            res.status(201).json({
                success: false,
                message: 'No Image uploaded!'
            });
        }
    })

};

exports.uploadInsideView = (req, res) => {
    const id = req.params.id;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIRINSIDE)
        },
        filename: function (req, file, cb) {
            cb(null, id + "_" + file.originalname)
        }
    })

    var upload = multer({
        storage: storage,
        limits: { fileSize: maxSize }
    }).single('insideFile');
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send({
                message: "File size cannot be larger than 4MB!",
            });
        }

        if (req.file != null || undefined) {
            const filePath = req.file.path;

            const newFilePathResize = DIRINSIDER + id + "_" + req.file.originalname
            sharp(filePath)
                .withMetadata()
                .toFile(newFilePathResize, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            updateInsideView(id, newFilePathResize);
            res.json({
                success: true,
                message: 'Image uploaded!'
            });
        } else {
            res.status(201).json({
                success: false,
                message: 'No Image uploaded!'
            });
        }
    })

};

exports.getImageBackView = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var filepath = results.BackPath;
            res.sendFile(filepath);
        }
    });
};
exports.getImageFrontView = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var filepath = results.FrontPath;
            res.sendFile(filepath);
        }
    });
};
exports.getImageLeftView = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var filepath = results.LeftPath;
            res.sendFile(filepath);
        }
    });
};
exports.getImageRightView = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var filepath = results.RightPath;
            res.sendFile(filepath);
        }
    });
};
exports.getImageInsideView = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var filepath = results.InsidePath;
            res.sendFile(filepath);
        }
    });
};

exports.getImageInsideViewBase64 = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var imageAsBase64 = fs.readFileSync(results.InsidePath, 'base64');
            res.status(200).json({
                success: true,
                message: 'Image as Base 64',
                data: imageAsBase64
            });
        }
    });
};
exports.getImageBackViewBase64 = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var imageAsBase64 = fs.readFileSync(results.BackPath, 'base64');
            res.status(200).json({
                success: true,
                message: 'Image as Base 64',
                data: imageAsBase64
            });
        }
    });
};
exports.getImageFrontViewBase64 = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var imageAsBase64 = fs.readFileSync(results.FrontPath, 'base64');
            res.status(200).json({
                success: true,
                message: 'Image as Base 64',
                data: imageAsBase64
            });
        }
    });
};
exports.getImageLeftViewBase64 = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var imageAsBase64 = fs.readFileSync(results.LeftPath, 'base64');
            res.status(200).json({
                success: true,
                message: 'Image as Base 64',
                data: imageAsBase64
            });
        }
    });
};
exports.getImageRightViewBase64 = async (req, res) => {

    const datasend = {
        QuotationID: req.params.id
    };

    getImagebyPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var imageAsBase64 = fs.readFileSync(results.RightPath, 'base64');
            res.status(200).json({
                success: true,
                message: 'Image as Base 64',
                data: imageAsBase64
            });
        }
    });
};