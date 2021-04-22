const db = require("../models");
const Quote = db.Quotation;
const QuoteLog = db.QuotationLog;
const QuoteDetailMV = db.QuotationMV;
const Customer = db.Customer;
const Coverage = db.Coverage;
const motorout = require('../models/response/QuoteMotor.model')
const SaveUser = require('../models/care/saveuser.model')
const SavePolicy = require('../models/care/savepolicy.model')
const http = require('../mw/http')
const MwClient = require('../mw/motor/mw.motor.client');
const config = require("../config/mw.config");
const configdb = require("../config/db.config");

const convertdatedb  = (data) => {
    var DateDB = new Date(data).toLocaleString();
    var res = DateDB.slice(0, 9);
    return res
}

const EIICareUser  = ( dataname, datano ) => {
    var EIIID ='AOTG-' + dataname + '-' + datano    
    return EIIID
}

const ReffNo  = (dataquot ) => {
    var refyear = 2000
    var year = new Date().getFullYear()
    var yearShort = year - refyear
    var ReffNo ='AOTG-' + yearShort + '-' + configdb.motorproductid + dataquot    
    return ReffNo
}

module.exports = {
    updateQuotationforPolicy: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            CarePolicyID: data.CarePolicyID,
            RefferenceNumber : data.RefferenceNumber,
            PolicyNo : data.PolicyNo,
            Status : 1,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    updateQuotationforSubmitPolicy: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            IsSubmittedCare: data.IsSubmittedCare,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    ApproveQuoteByPK: async (data, callback) => {
        Quote.hasOne(QuoteDetailMV, { foreignKey: 'QuotationID' });
        Quote.hasMany(Coverage, { foreignKey: 'QuotationID' });
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        await Quote.findAll(
            {
                where: data,
                raw: true,
                include: [{
                    model: QuoteDetailMV,
                    attributes: { exclude: ['QuotationID'] }

                },
                {
                    model: Coverage,
                    attributes: { exclude: ['QuotationID'] }
                }
                    , {
                    model: Customer,
                    attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

                }
                ],
                attributes: { exclude: ['CreateDate', 'UpdateDate'] },

            })
            .then((data) => {
                if (data != null) {
                    try {
                        var coverageDetails = [];
                        for (let i = 0; i < data.length; i++) {
                            const coverage = data[i]['Coverages.RateCode']
                            coverageDetails.push(coverage);
                        }

                        SaveUser.ID = EIICareUser(data[0]['Customer.CustomerName'], data[0]['Customer.IDNo']) ;
                        SaveUser.BirthDate = convertdatedb(data[0]['Customer.BirthDate']);
                        SaveUser.Email = data[0]['Customer.Email'];
                        SaveUser.ID_Name = data[0]['Customer.CustomerName'];
                        SaveUser.ID_No = data[0]['Customer.IDNo'];
                        SaveUser.ID_Type = data[0]['Customer.IDType'];
                        SaveUser.Mobile = data[0]['Customer.PhoneNo'];
                        SaveUser.Name = data[0]['Customer.CustomerName'];
                        SaveUser.Address_1 = data[0]['Customer.Address'];
                        SaveUser.City = data[0]['Customer.City'];
                        SaveUser.Gender = data[0]['Customer.Gender'];

                       

                        SavePolicy.ValueID1 = data[0]['QuoDetailMV.Brand'];
                        SavePolicy.ValueID2 = data[0]['QuoDetailMV.Model'];
                        SavePolicy.ValueID4 = data[0]['QuoDetailMV.Type'];
                        SavePolicy.ValueID10 = data[0]['QuoDetailMV.Year'];
                        SavePolicy.ValueID15 = data[0].Region;
                        SavePolicy.ValueDesc5 = data[0]['QuoDetailMV.LicenseNo'];
                        SavePolicy.ValueDesc6 = data[0]['QuoDetailMV.EngineNo'];
                        SavePolicy.ValueDesc7 = data[0]['QuoDetailMV.ChassisNo'];
                        SavePolicy.ValueDesc10 = data[0]['QuoDetailMV.Year'];
                        SavePolicy.ProductID = configdb.motorproductid;
                        SavePolicy.CoverageID = data[0].Topro;
                        SavePolicy.InceptionDate = convertdatedb(data[0].StartDate);
                        SavePolicy.ExpiryDate = convertdatedb(data[0].EndDate);
                        SavePolicy.SI_1 = data[0].MainSI;
                        SavePolicy.CoverageCode1 = coverageDetails[0];
                        SavePolicy.CoverageCode2 = coverageDetails[1] == undefined ? null : coverageDetails[1];
                        SavePolicy.CoverageCode3 = coverageDetails[2] == undefined ? null : coverageDetails[2];
                        SavePolicy.CoverageCode4 = coverageDetails[4] == undefined ? null : coverageDetails[4];
                        SavePolicy.CoverageCode5 = coverageDetails[5] == undefined ? null : coverageDetails[5];
                        SavePolicy.CoverageCode6 = coverageDetails[6] == undefined ? null : coverageDetails[6];
                        SavePolicy.CoverageCode7 = coverageDetails[7] == undefined ? null : coverageDetails[7];
                        SavePolicy.CoverageCode8 = coverageDetails[8] == undefined ? null : coverageDetails[8];
                        SavePolicy.CoverageCode9 = coverageDetails[9] == undefined ? null : coverageDetails[9];
                        SavePolicy.CoverageCode10 = coverageDetails[10] == undefined ? null : coverageDetails[10];
                        SavePolicy.PolicyHolder = EIICareUser(data[0]['Customer.CustomerName'], data[0]['Customer.IDNo']) ;
                        SavePolicy.AID = EIICareUser(data[0]['Customer.CustomerName'], data[0]['Customer.IDNo']) ;
                        SavePolicy.InsuredName = data[0]['Customer.CustomerName'];
                        SavePolicy.RefNo = ReffNo(data[0].QuotationID);
                        SavePolicy.DiscPCT = data[0].DiscPCT;
                        
                        let List = {
                            UserSys: SaveUser,
                            PolicyData : SavePolicy
                        };

                        return callback(null, List);
                    }
                    catch (error) {
                        return callback(error);
                    }
                }
                // return callback(err, data);
            }).catch((error) => {
                return callback(error);
            });

    },
    getQuotebyPK: async (data, callback) => {
        Quote.hasOne(QuoteDetailMV, { foreignKey: 'QuotationID' });
        Quote.hasMany(Coverage, { foreignKey: 'QuotationID' });
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        await Quote.findAll(
            {
                where: data,
                raw: true,
                include: [{
                    model: QuoteDetailMV,
                    attributes: { exclude: ['QuotationID'] }

                },
                {
                    model: Coverage,
                    attributes: { exclude: ['QuotationID'] }
                }
                    , {
                    model: Customer,
                    attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

                }
                ],
                attributes: { exclude: ['CreateDate', 'UpdateDate'] },

            })
            .then((data) => {
                if (data != null) {
                    try {
                        motorout.quotationid = data[0].QuotationID
                        motorout.customerid = data[0].CustomerID
                        motorout.agentid = data[0].AgentID
                        motorout.product_id = data[0].TOC
                        motorout.coverage_id = data[0].Topro
                        motorout.region_id = data[0].Region
                        motorout.inception_date = data[0].StartDate
                        motorout.end_date = data[0].EndDate
                        motorout.sum_insured_1 = data[0].MainSI
                        motorout.total_payable = data[0].PolicyCost
                        motorout.discount_pct = data[0].DiscPCT
                        motorout.total_discount = data[0].DiscAmount
                        motorout.total_premium = data[0].Premium
                        motorout.total_stamp_duty = data[0].StampDuty
                        motorout.status = data[0].Status
                        motorout.policyNo = data[0].PolicyNo
                        motorout.ANO = data[0].ANO

                        var coverageDetails = [];

                        var vehicleDetails = {
                            brand: data[0]['QuoDetailMV.Brand'],
                            model: data[0]['QuoDetailMV.Model'],
                            type: data[0]['QuoDetailMV.Type'],
                            functions: data[0]['QuoDetailMV.Function'],
                            license_number: data[0]['QuoDetailMV.LicenseNo'],
                            chassis_number: data[0]['QuoDetailMV.ChassisNo'],
                            engine_number: data[0]['QuoDetailMV.EngineNo'],
                            manufactured_year: data[0]['QuoDetailMV.Year'],
                            manufactured_yeardesc: data[0]['QuoDetailMV.Year']

                        };
                        var CustomerDetails = {
                            id: data[0]['Customer.CustomerID'],
                            name: data[0]['Customer.CustomerName'],
                            type: data[0]['Customer.IDType'],
                            id_number: data[0]['Customer.IDNo'],
                            gender: data[0]['Customer.Gender'],
                            birth_date: data[0]['Customer.BirthDate'],
                            email: data[0]['Customer.Email'],
                            telephone_number: data[0]['Customer.PhoneNo'],
                            address_1: data[0]['Customer.Address'],
                            city: data[0]['Customer.City'],
                            zipcode: data[0]['Customer.ZipCode']


                        };
                        motorout.vehicle_detail = vehicleDetails
                        motorout.customer_detail = CustomerDetails

                        for (let i = 0; i < data.length; i++) {
                            const coverage = {
                                rate: data[i]['Coverages.Rate'],
                                ismain: data[i]['Coverages.IsMain'],
                                amount: data[i]['Coverages.SumInsured'],
                                coverage_code: data[i]['Coverages.RateCode'],
                                coverage_detail: data[i]['Coverages.CoverageDetail'],
                                admin_fee: data[i]['Coverages.AdminFee']

                            }
                            coverageDetails.push(coverage);
                        }
                        motorout.premium_details = coverageDetails

                        //console.log(motorout)

                        return callback(null, motorout);
                    }
                    catch (error) {
                        return callback(error);
                    }
                }
                // return callback(err, data);
            }).catch((error) => {
                return callback(error);
            });

    },
    getImagebyPK: async (data, callback) => {
        Quote.hasOne(QuoteDetailMV, { foreignKey: 'QuotationID' });
        await Quote.findAll(
            {
                where: data,
                raw: true,
                include: [{
                    model: QuoteDetailMV,
                    attributes: { exclude: ['QuotationID'] }

                }
                ],
                attributes: { exclude: ['CreateDate', 'UpdateDate'] },

            })
            .then((data) => {
                if (data != null) {
                    try {
                        var ImagePath = {
                            FrontPath: data[0]['QuoDetailMV.FrontView'],
                            LeftPath: data[0]['QuoDetailMV.LeftView'],
                            RightPath: data[0]['QuoDetailMV.RightView'],
                            BackPath: data[0]['QuoDetailMV.BackView']
                        }
                        return callback(null, ImagePath);
                    }
                    catch (error) {
                        return callback(error);
                    }
                }
                // return callback(err, data);
            }).catch((error) => {
                return callback(error);
            });

    },
    createQuote: async (data, callback) => {
        await Quote.create(data)
            .then((res) => {
                if (res != null) {
                    try {
                        return callback(null, res["dataValues"]);
                    }
                    catch (error) {
                        return callback(error);
                    }
                }
                return callback(null, res["dataValues"]);
            }).catch((err) => {
                return callback(err);
            });
    },
    createQuoteLog: async (data) => {
        const Datalog = {
            QuotationID: data.QuotationID
        };
        await QuoteLog.create(Datalog)
            .then((res) => {
            }).catch((err) => {
            });
    },
    createQuoteDetail: async (data) => {
        await QuoteDetailMV.create(data)
            .then((res) => {
            }).catch((err) => {
            });
    },
    createCoverageDetail: async (data, id, SI, DiscPCT) => {
        for (let i = 0; i < data.length; i++) {
            const dataCoverage = {
                QuotationID: id,
                RateCode: data[i].coverage_code,
                IsMain: data[i].is_main,
                SumInsured: SI,
                Rate: data[i].rate,
                Premium: data[i].amount,
                DiscPCT: DiscPCT,
                AdminFee: data[i].admin_fee,
                CoverageDetail: data[i].coverage_detail,
            };
            await Coverage.create(dataCoverage)
                .then((res) => {
                }).catch((err) => {
                });
        };
    },
    updateCustomerQuotation: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            CustomerID: data,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    createorupdateCustomer: async (datasend, callback) => {
        let condition = {
            IDType: datasend.IDType,
            IDNo: datasend.IDNo,
            CustomerName: datasend.CustomerName,
            AgentID: datasend.AgentID
        };
        await Customer.findAll(
            {
                where: condition,
                raw: true
            })
            .then((data) => {
                if (data[0] != null) {
                    try {
                        Customer.update({
                            UpdateDate: Date.now()
                        }, {
                            where: {
                                CustomerID: data[0].CustomerID
                            }
                        });

                        return callback(null, data[0].CustomerID);

                    }
                    catch (error) {
                        return callback(error);
                    }

                }
                else {
                    Customer.create(datasend)
                        .then((res) => {
                            if (res != null) {
                                try {
                                    return callback(null, res["dataValues"].CustomerID);
                                }
                                catch (error) {
                                    return callback(error);
                                }
                            }

                        }).catch((err) => {
                        });
                }

            }).catch((error) => {
                return callback(error);
            });
    },

    updateFrontView: async (id, data) => {
        await QuoteDetailMV.update({
            FrontView: data
        }, {
            where: {
                QuotationID: id
            }
        })
    },
    updateBackView: async (id, data) => {
        await QuoteDetailMV.update({
            BackView: data
        }, {
            where: {
                QuotationID: id
            }
        })
    },
    updateLeftView: async (id, data) => {
        await QuoteDetailMV.update({
            LeftView: data
        }, {
            where: {
                QuotationID: id
            }
        })
    },
    updateRightView: async (id, data) => {
        await QuoteDetailMV.update({
            RightView: data
        }, {
            where: {
                QuotationID: id
            }
        })
    },
    updateInsideView: async (id, data) => {
        await QuoteDetailMV.update({
            InsideView: data
        }, {
            where: {
                QuotationID: id
            }
        })
    }


}