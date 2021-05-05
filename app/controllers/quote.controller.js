const db = require("../models");
const Quote = db.Quotation;
const Op = db.Sequelize.Op;
const { createCoverageDetail, createQuote,
    createQuoteLog, createQuoteDetail,
    updateFrontView, updateBackView, updateLeftView, updateRightView,
    createorupdateCustomer, updateCustomerQuotation,
    getQuotebyPK, getImagebyPK, ApproveQuoteByPK, updateInsideView,
    updateQuotationforPolicy, updateQuotationforSubmitPolicy,
    updateQuotation, updateQuoteDetail, updateCoverageDetail } = require("../services/quotation.service");
const { createResponseLog } = require("../services/responselog.service");
const { SaveUser, SavePolicy, SubmitPolicy } = require("../services/care.service");
const multer = require('multer');
const path = require("path");
const fs = require('fs');
const url = require('url');
const maxSize = 4 * 1024 * 1024;
const Policy = require('../models/care/savepolicy.model');
const mw = require('../mw/motor/mw.motor.client');
const { User } = require("../models");
const DIRFRONT = path.join(__dirname, '../../uploads/frontview');
const DIRBACK = path.join(__dirname, '../../uploads/backview');
const DIRLEFT = path.join(__dirname, '../../uploads/leftview');
const DIRRIGHT = path.join(__dirname, '../../uploads/rightview');
const DIRINSIDE = path.join(__dirname, '../../uploads/insideview');
const config = require('../config/db.config');



var Datenow = new Date().toLocaleString();

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

exports.ApproveQuote = async (req, res) => {
    const datasend = {
        QuotationID: req.params.id
    };
    var urlobj = url.parse(req.originalUrl);
    urlobj.protocol = req.protocol;
    urlobj.host = req.get('host');
    var requrl = url.format(urlobj);

    ApproveQuoteByPK(datasend, (err, results) => {
        if (err) {
            return res.json({
                message: err
            });
        }
        else {
            var ResponseCareUser = null;
            var ResponseCarePolicy = null;
            SaveUser(JSON.stringify(results.UserSys), (err, resUser) => {
                if (err) {
                    const Response = "Error Cek Param yang dikirim & Save User gagal dilakukan";
                    const Status = 422;
                    SaveCareLog(Response, Status, req.params.id, results.UserSys, config.saveUserCareURl);
                }
                else {
                    ResponseCareUser = resUser.data;
                    SaveCareLog(JSON.stringify(ResponseCareUser), ResponseCareUser.code,
                        req.params.id, results.UserSys, config.saveUserCareURl);

                    SavePolicy(JSON.stringify(results.PolicyData), (err, resultPolicy) => {
                        if (err) {
                            const Response = "Error Cek Param yang dikirim & Save Policy gagal dilakukan";
                            const Status = 422;
                            SaveCareLog(Response, Status, req.params.id, results.PolicyData, config.saveUserCareURl);
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

    const QuotationID = req.body.quotationid;

    const dataQuotes = {
        CustomerID: req.body.customerid,
        AgentID: req.body.agentid,
        CreateDate: Datenow,
        TOC: req.body.product_id,
        Topro: req.body.coverage_id,
        Region: req.body.region_id,
        StartDate: req.body.inception_date,
        EndDate: EndDate,
        MainSI: req.body.sum_insured_1,
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
        MailFetchTries: 0
    };


    const PremiumDetails = req.body.premium_details;
    const VehicleDetails = req.body.vehicle_detail;
    const Customer = req.body.customer_detail;

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
        AgentID: req.body.agentid
    };

    if (Customer.name == undefined || dataCustomer.IDNo == null
        || dataCustomer.IDType == null || dataCustomer.CustomerName == null) {
        res.status(201).json({
            success: false,
            suspect: {
                Customer: 'Data Customer Kosong atau',
                IDNo: 'ID Number Kosong atau ',
                IDType: 'ID Type Kosong atau',
                CustomerName: 'Nama Customer Kosong'

            },
            message: 'Cek kembali lemparan Anda'
        });
    }
    if (VehicleDetails.brand == undefined) {

        res.status(201).json({
            success: false,
            message: 'Data Kendaraan Kosong'
        });
    }
    else {
        if (QuotationID != null) {
            updateQuotation(QuotationID, dataQuotes, async (err, results) => {
                if (err) {
                    return res.json({
                        message: err
                    });
                }
                else {
                    createorupdateCustomer(dataCustomer, (err, resultsC) => {
                        // console.log(results);
                        updateCustomerQuotation(QuotationID, resultsC);
                        customerresult = resultsC;

                        // results.CustomerID = resultsC;

                    });
                    const DataUpdate = {
                        Message: "Update Data Quotation " + QuotationID,
                        data: req.body
                    }

                    dataVehicle.QuotationID = QuotationID;
                    DataLog.QuotationID = QuotationID;
                    DataLog.Response = JSON.stringify(DataUpdate);

                    createResponseLog(DataLog);
                    updateQuoteDetail(dataVehicle);
                    createQuoteLog(dataVehicle);

                    updateCoverageDetail(PremiumDetails, QuotationID,
                        req.body.sum_insured_1, req.body.discount_pct);


                    res.status(200).send({
                        data : req.body
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
                        createorupdateCustomer(dataCustomer, (err, resultsC) => {
                            // console.log(results);
                            updateCustomerQuotation(results.QuotationID, resultsC);
                            customerresult = resultsC;

                            // results.CustomerID = resultsC;

                        });
                        dataVehicle.QuotationID = results.QuotationID;
                        DataLog.QuotationID = results.QuotationID;
                        DataLog.Response = JSON.stringify(results);
                        createResponseLog(DataLog);
                        createQuoteDetail(dataVehicle);
                        createQuoteLog(results);

                        createCoverageDetail(PremiumDetails, results.QuotationID,
                            req.body.sum_insured_1, req.body.discount_pct);

                        // results.CustomerID = customerresult;
                        await res.status(200).send({
                            results
                        });

                    } catch (error) {

                    }

                }

            });
        }


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
            updateFrontView(id, filePath);
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
            updateBackView(id, filePath);
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

exports.uploadLeftView = (req, res) => {
    const id = req.params.id;

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, DIRLEFT)
        },
        filename: function (req, file, cb) {
            cb(null, id + "_" + file.originalname)
        }
    })

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
            updateLeftView(id, filePath);
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
            updateRightView(id, filePath);
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
            updateInsideView(id, filePath);
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