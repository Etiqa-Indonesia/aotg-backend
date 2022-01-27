const db = require("../models");
var pdf = require("pdf-creator-node");
const Quote = db.Quotation;
const Agent = db.Agent;
const QuoteLog = db.QuotationLog;
const QuoteDetailMV = db.QuotationMV;
const Customer = db.Customer;
const Coverage = db.Coverage;
const Invoices = db.Invoices;
const motorout = require('../models/response/QuoteMotor.model')
const SaveUser = require('../models/care/saveuser.model')
const SavePolicy = require('../models/care/savepolicy.model')
const http = require('../mw/http')
const MwClient = require('../mw/motor/mw.motor.client');
const config = require("../config/mw.config");
const configdb = require("../config/db.config");
const fs = require('fs');
const path = require('path');
const { numberWithCommas } = require('./global.service');
const { info } = require("console");
const DIRDRAFTQUOT = path.join(__dirname, '../../quotationdraft/');
const { SendMailDraftQuptation } = require('../services/backoffice/mail.quotation.service')
const DirHTMLMailCreateQuote = path.join(__dirname, '../mail/calculatequotation.html');
const { saveProfile } = require("../mw/motor/mw.motor.client");
const SaveProfile = require("../models/care/saveprofile.model")

var html = fs.readFileSync(DirHTMLMailCreateQuote, "utf8")
var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    // header: {
    //     "height": "30mm",
    //     "contents": "<div style='text-align: left;'><img src='https://uatechannel.etiqa.co.id/static/etiqa.png' style='width: 150px;'</div>"
    // }
};


const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

const EIICareUser = (dataname, datano) => {
    var EIIID = 'AOTG-' + datano
    return EIIID
}

const ReffNo = (dataquot) => {
    var refyear = 2000
    var year = new Date().getFullYear()
    var yearShort = year - refyear
    var ReffNo = 'AOTG-' + yearShort + '-' + configdb.motorproductid + dataquot
    return ReffNo
}

module.exports = {

    updateDynamicQuotation: async (QuotationID, data) => {
        console.log(data)
        await Quote.update({
            IsPaid: data.IsPaid,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: QuotationID
            }
        });
    },
    createDraftQuotation: async (data, id) => {

        var Jaminan_Dasar = null;
        var Nilai_TOC = null;
        var Coverages = [];

        for (let i = 0; i < data.premium_details.length; i++) {
            if (data.premium_details[i]['is_main'] == "1") {
                Jaminan_Dasar = data.premium_details[i]['coverage_detail']
                Nilai_TOC = await numberWithCommas(data.premium_details[i]['amount'])
            }
            if (data.premium_details[i]['is_main'] == "0") {

                const DetailCoverage = {
                    CoverageDetail: null,
                    CoveragesValue: null,
                    CoverageDetailPrintBottom: null
                }

                if (data.premium_details[i]['coverage_code'] == "TPL-01-17") {

                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail'] + ' Nilai Pertanggungan ' + await numberWithCommas(data.sum_insured_2)
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']
                }
                else if (data.premium_details[i]['coverage_code'] == "PA-01") {
                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail'] + ' Nilai Pertanggungan ' + await numberWithCommas(data.sum_insured_3)
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']

                }
                else if (data.premium_details[i]['coverage_code'] == "PA-02") {
                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail'] + ' Nilai Pertanggungan ' + await numberWithCommas(data.sum_insured_4)
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']
                }
                else {
                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail']
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']
                }
                Coverages.push(DetailCoverage)
            }

        }
        try {
            var outputpdf = 'MotorVehicle_' + id + '_' + data.customer_detail.name + '.pdf'

            var document = {
                html: html,
                data: {
                    Name: data.customer_detail.name,
                    quote: id,
                    Jaminan_Dasar: Jaminan_Dasar,
                    Discount: data.discount_pct,
                    Tahun_Pembuatan: data.vehicle_detail.manufactured_year,
                    Start: data.inception_date,
                    End: data.printquotationdata.end_date,
                    Nilai_TOC: Nilai_TOC,
                    Coverages: Coverages,
                    Plat: data.vehicle_detail.license_number,
                    Lokasi: data.printquotationdata.lokasi,
                    Wilayah: data.printquotationdata.wilayah,
                    Merek: data.printquotationdata.merek,
                    Model: data.printquotationdata.model,
                    Type: data.printquotationdata.type,
                    Rangka: data.vehicle_detail.chassis_number,
                    Nomor_Mesin: data.vehicle_detail.engine_number,
                    Nilai_Pertanggungan: await numberWithCommas(data.sum_insured_1),
                    Total: await numberWithCommas(data.total_premium),
                    Biaya: await numberWithCommas(data.premium_details[0].admin_fee),
                    Materai: await numberWithCommas(data.total_stamp_duty),
                    TotalDiscount: await numberWithCommas(data.total_discount),
                    GrandTotal: await numberWithCommas(data.total_payable)

                },
                path: DIRDRAFTQUOT + outputpdf,
                type: "",
            };
        } catch (error) {
            console.log(error)
        }

        try {
            await pdf.create(document, options)


        } catch (error) {
            console.log(error)
        }

        let Info = {
            outputpdf: outputpdf,
            dir: DIRDRAFTQUOT + '/' + outputpdf
        };
        console.log(Info)

        return Info

    },
    updateQuotationforPolicy: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            CarePolicyID: data.CarePolicyID,
            RefferenceNumber: data.RefferenceNumber,
            PolicyNo: data.PolicyNo,
            Status: configdb.statusApprove,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    updateQuotationforANO: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            ANO: data.ANO,
            MailFetchTries: data.MailFetchTries,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    updateQuotationforPayment: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            IsPaid: data.IsPaid,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    updateQuotationforSentMail: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            MailSent: data.MailSent,
            MailFetchTries: data.MailFetchTries,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: id
            }
        });
    },
    updateQuotationforRetrieveFile: async (id, data) => {
        // console.log(id,data);
        await Quote.update({
            EfilePath: data,
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
    updateQuotationforQuoteBackOffice: async (data) => {
        // console.log(id,data);
        await Quote.update({
            Remarks: data.Remarks,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: data.QuotationID
            }
        });
    },
    rejectQuotationforBackOffice: async (data) => {
        // console.log(id,data);
        await Quote.update({
            Remarks: data.Remarks,
            Status: configdb.statusReject,
            UpdateDate: Date.now()
        }, {
            where: {
                QuotationID: data.QuotationID
            }
        });
    },
    updateQuotation: async (id, data, callback) => {
        await Quote.update({
            TOC: data.TOC,
            Topro: data.Topro,
            Region: data.Region,
            StartDate: data.StartDate,
            EndDate: data.EndDate,
            MainSI: data.MainSI,
            SI_2: data.SI_2,
            SI_3: data.SI_3,
            SI_4: data.SI_4,
            SI_5: data.SI_5,
            Premium: data.Premium, //Total Premium
            DiscPCT: data.DiscPCT,
            DiscAmount: data.DiscAmount, //Total discount
            PolicyCost: data.PolicyCost,
            StampDuty: data.StampDuty,
            Status: data.Status,
            UpdateDate: Date.now()

        }, {
            where: {
                QuotationID: id
            }
        }).then((res) => {
            // console.log(res)
            if (res != null) {
                try {
                    data.EndDate = undefined;
                    return callback(null, data);
                }
                catch (error) {
                    return callback(error);
                }
            }
            return callback(null, data);
        }).catch((err) => {
            return callback(err);
        });
    },
    ApproveQuoteByPK: async (data, callback) => {
        Quote.hasOne(QuoteDetailMV, { foreignKey: 'QuotationID' });
        Quote.hasMany(Coverage, { foreignKey: 'QuotationID' });
        Quote.belongsTo(Customer, { foreignKey: 'CustomerID' });
        Quote.belongsTo(Agent, { foreignKey: 'AgentID' })
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
                },
                {
                    model: Customer,
                    attributes: { exclude: ['QuotationID', 'CreateDate', 'UpdateDate'] }

                },
                {
                    model: Agent,
                    attributes: { exclude: ['JoinedDate', 'TerminatedDate'] }
                }
                ],
                attributes: { exclude: ['CreateDate', 'UpdateDate'] },

            })
            .then((data) => {
                if (data != null) {
                    try {
                        var coverageDetails = [];
                        const IDCheck = data[0]['Agent.AgentID'] + data[0]['Customer.IDNo'] + data[0]['Customer.CustomerID']
                        const UseID = EIICareUser('', IDCheck)
                        for (let i = 0; i < data.length; i++) {
                            const coverage = data[i]['Coverages.RateCode']
                            coverageDetails.push(coverage);
                        }

                        SaveUser.ID = data[0]['Agent.ProfileID']
                        SaveUser.Address_1 = data[0]['Agent.Adress']
                        SaveUser.City = data[0]['Agent.City']
                        SaveUser.Email = data[0]['Agent.Email']
                        SaveUser.Mobile = data[0]['Agent.PhoneNo']
                        SaveUser.ID_Name = data[0]['Agent.Name']
                        SaveUser.ID_Type = data[0]['Agent.IDType']
                        SaveUser.ID_No = data[0]['Agent.IDNo']
                        SaveUser.Name = data[0]['Agent.Name']


                        SaveProfile.ID = UseID
                        SaveProfile.BirthDate = formatDate(data[0]['Customer.BirthDate']);
                        SaveProfile.Email = data[0]['Customer.Email'].split(' ').join('');
                        SaveProfile.ID_Name = data[0]['Customer.CustomerName'];
                        SaveProfile.ID_No = UseID
                        SaveProfile.ID_Type = data[0]['Customer.IDType'];
                        SaveProfile.Name = data[0]['Customer.CustomerName'];
                        SaveProfile.Mobile = data[0]['Customer.PhoneNo'];
                        SaveProfile.Address_1 = data[0]['Customer.Address'];
                        SaveProfile.Gender = data[0]['Customer.Gender'];
                        SaveProfile.AID = data[0]['Agent.ProfileID']


                        // SaveUser.ID = EIICareUser(data[0]['Customer.CustomerName'], data[0]['Customer.IDNo']);

                        // SaveUser.BirthDate = formatDate(data[0]['Customer.BirthDate']);
                        // SaveUser.Email = data[0]['Customer.Email'].split(' ').join('');
                        // SaveUser.ID_Name = data[0]['Customer.CustomerName'];
                        // SaveUser.ID_No = data[0]['Customer.IDNo'];
                        // SaveUser.ID_Type = data[0]['Customer.IDType'];
                        // SaveUser.Mobile = data[0]['Customer.PhoneNo'];
                        // SaveUser.Name = data[0]['Customer.CustomerName'];
                        // SaveUser.Address_1 = data[0]['Customer.Address'];
                        // SaveUser.City = data[0]['Customer.City'];
                        // SaveUser.Gender = data[0]['Customer.Gender'];



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
                        SavePolicy.InceptionDate = formatDate(data[0].StartDate);
                        SavePolicy.ExpiryDate = formatDate(data[0].EndDate);
                        SavePolicy.SI_1 = data[0].MainSI;
                        SavePolicy.SI_2 = data[0].SI_2 == null ? 0 : data[0].SI_2;
                        SavePolicy.SI_3 = data[0].SI_3 == null ? 0 : data[0].SI_3;
                        SavePolicy.SI_4 = data[0].SI_4 == null ? 0 : data[0].SI_4;
                        SavePolicy.SI_5 = data[0].SI_5 == null ? 0 : data[0].SI_5;
                        SavePolicy.CoverageCode1 = coverageDetails[0];
                        SavePolicy.CoverageCode2 = coverageDetails[1] == undefined ? null : coverageDetails[1];
                        SavePolicy.CoverageCode3 = coverageDetails[2] == undefined ? null : coverageDetails[2];
                        SavePolicy.CoverageCode4 = coverageDetails[3] == undefined ? null : coverageDetails[3];
                        SavePolicy.CoverageCode5 = coverageDetails[4] == undefined ? null : coverageDetails[4];
                        SavePolicy.CoverageCode6 = coverageDetails[5] == undefined ? null : coverageDetails[5];
                        SavePolicy.CoverageCode7 = coverageDetails[6] == undefined ? null : coverageDetails[6];
                        SavePolicy.CoverageCode8 = coverageDetails[7] == undefined ? null : coverageDetails[7];
                        SavePolicy.CoverageCode9 = coverageDetails[8] == undefined ? null : coverageDetails[8];
                        SavePolicy.CoverageCode10 = coverageDetails[9] == undefined ? null : coverageDetails[9];
                        // SavePolicy.PolicyHolder = EIICareUser(data[0]['Customer.CustomerName'], data[0]['Customer.IDNo']);
                        // SavePolicy.AID = EIICareUser(data[0]['Customer.CustomerName'], data[0]['Customer.IDNo']);
                        SavePolicy.PolicyHolder = UseID
                        SavePolicy.AID = data[0]['Agent.ProfileID']
                        SavePolicy.InsuredName = data[0]['Customer.CustomerName'];
                        SavePolicy.RefNo = ReffNo(data[0].QuotationID);
                        SavePolicy.DiscPCT = data[0].DiscPCT;
                        SavePolicy.StampDuty = data[0].StampDuty;

                        let List = {
                            UserSys: SaveUser,
                            PolicyData: SavePolicy,
                            UserProfile : SaveProfile,
                            IDSysUser : data[0]['Agent.ProfileID'],
                            IDUserProfile : UseID
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
                        motorout.sum_insured_2 = data[0].SI_2
                        motorout.sum_insured_3 = data[0].SI_3
                        motorout.sum_insured_4 = data[0].SI_4
                        motorout.sum_insured_5 = data[0].SI_5
                        motorout.total_payable = data[0].PolicyCost
                        motorout.discount_pct = data[0].DiscPCT
                        motorout.total_discount = data[0].DiscAmount
                        motorout.total_premium = data[0].Premium
                        motorout.total_stamp_duty = data[0].StampDuty
                        motorout.status = data[0].Status
                        motorout.policyNo = data[0].PolicyNo
                        motorout.ANO = data[0].ANO
                        motorout.Remarks = data[0].Remarks
                        var Efile64 = null;

                        if (data[0].EfilePath != null) {
                            Efile64 = fs.readFileSync(data[0].EfilePath, 'base64');
                        }

                        motorout.EfileBase64 = Efile64;

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
                                amount: data[i]['Coverages.Premium'],
                                amount_detail: data[i]['Coverages.SumInsured'],
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
                            BackPath: data[0]['QuoDetailMV.BackView'],
                            InsidePath: data[0]['QuoDetailMV.InsideView']
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
    createQuoteLogBackOffice: async (data) => {
        const Datalog = {
            QuotationID: data.QuotationID,
            Remarks: data.Remarks,
            Status: data.Status,
            UserID: data.UserID

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
    updateQuoteDetail: async (data) => {
        await QuoteDetailMV.update({
            Brand: data.Brand,
            Model: data.Model,
            Type: data.Type,
            Function: data.Function,
            EngineNo: data.EngineNo,
            LicenseNo: data.LicenseNo,
            ChassisNo: data.ChassisNo,
            Year: data.Year
        }, {
            where: {
                QuotationID: data.QuotationID
            }
        });
    },
    createCoverageDetail: async (data, id, SI, DiscPCT) => {
        for (let i = 0; i < data.length; i++) {
            const dataCoverage = {
                QuotationID: id,
                RateCode: data[i].coverage_code,
                IsMain: data[i].is_main,
                SumInsured: data[i].amount_detail,
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
    updateCoverageDetail: async (data, id, SI, DiscPCT) => {
        await Coverage.destroy({
            where: {
                QuotationID: id
            }
        });
        for (let i = 0; i < data.length; i++) {
            const dataCoverage = {
                QuotationID: id,
                RateCode: data[i].coverage_code,
                IsMain: data[i].is_main,
                SumInsured: data[i].amount_detail,
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
    checkExistCustomer: async (datasend) => {
        let condition = {
            IDType: datasend.IDType,
            IDNo: datasend.IDNo,
            CustomerName: datasend.CustomerName,
            AgentID: datasend.AgentID
        };
        await Customer.findOne(
            {
                where: condition,
                raw: true
            })
    },
    createCustomer: async (datasend) => {
        console.log(datasend);

        return await Customer.create(datasend)
    },
    updateCustomer: async (CustomerID) => {

        return await Customer.update({
            UpdateDate: Date.now()
        }, {
            where: {
                CustomerID: CustomerID
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
            .then(async (data) => {

                if (data[0] != null) {
                    try {
                        Customer.update({
                            UpdateDate: Date.now(),
                            Email: datasend.Email,
                            Address: datasend.Address,
                            Gender: datasend.Gender,
                            BirthDate: datasend.BirthDate,
                            PhoneNo: datasend.PhoneNo,
                            ZipCode : datasend.ZipCode,
                            City: datasend.City
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
    },

    testCreatePDF: async (data, id) => {
        var Jaminan_Dasar = null;
        var Nilai_TOC = null;
        var Coverages = [];

        for (let i = 0; i < data.premium_details.length; i++) {
            if (data.premium_details[i]['is_main'] == "1") {
                Jaminan_Dasar = data.premium_details[i]['coverage_detail']
                Nilai_TOC = await numberWithCommas(data.premium_details[i]['amount'])
            }
            if (data.premium_details[i]['is_main'] == "0") {

                const DetailCoverage = {
                    CoverageDetail: null,
                    CoveragesValue: null,
                    CoverageDetailPrintBottom: null
                }

                if (data.premium_details[i]['coverage_code'] == "TPL-01-17") {

                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail'] + ' Nilai Pertanggungan ' + await numberWithCommas(data.sum_insured_2)
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']
                }
                else if (data.premium_details[i]['coverage_code'] == "PA-01") {
                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail'] + ' Nilai Pertanggungan ' + await numberWithCommas(data.sum_insured_3)
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']

                }
                else if (data.premium_details[i]['coverage_code'] == "PA-02") {
                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail'] + ' Nilai Pertanggungan ' + await numberWithCommas(data.sum_insured_4)
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']
                }
                else {
                    DetailCoverage.CoverageDetail = data.premium_details[i]['coverage_detail']
                    DetailCoverage.CoveragesValue = await numberWithCommas(data.premium_details[i]['amount'])
                    DetailCoverage.CoverageDetailPrintBottom = data.premium_details[i]['coverage_detail']
                }
                Coverages.push(DetailCoverage)
            }

        }
        try {
            var outputpdf = id + '_' + data.customer_detail.name + '.pdf'

            var document = {
                html: html,
                data: {
                    quote: id,
                    Jaminan_Dasar: Jaminan_Dasar,
                    Discount: data.discount_pct,
                    Tahun_Pembuatan: data.vehicle_detail.manufactured_year,
                    Start: data.inception_date,
                    End: data.printquotationdata.end_date,
                    Nilai_TOC: Nilai_TOC,
                    Coverages: Coverages,
                    Plat: data.vehicle_detail.license_number,
                    Lokasi: data.printquotationdata.lokasi,
                    Wilayah: data.printquotationdata.wilayah,
                    Merek: data.printquotationdata.merek,
                    Model: data.printquotationdata.model,
                    Type: data.printquotationdata.type,
                    Rangka: data.vehicle_detail.chassis_number,
                    Nomor_Mesin: data.vehicle_detail.engine_number,
                    Nilai_Pertanggungan: await numberWithCommas(data.sum_insured_1),
                    Total: await numberWithCommas(data.total_premium),
                    Biaya: await numberWithCommas(data.premium_details[0].admin_fee),
                    Materai: await numberWithCommas(data.total_stamp_duty),
                    TotalDiscount: await numberWithCommas(data.total_discount),
                    GrandTotal: await numberWithCommas(data.total_payable)

                },
                path: DIRDRAFTQUOT + outputpdf,
                type: "",
            };
        } catch (error) {
            console.log(error)
        }

        try {
            const a = await pdf.create(document, options)
            console.log("Sukses Create " + a)

        } catch (error) {
            console.log(error)
        }

        let Info = {
            outputpdf: outputpdf,
            dir: DIRDRAFTQUOT + '/' + outputpdf
        };

        return Info

    },
}