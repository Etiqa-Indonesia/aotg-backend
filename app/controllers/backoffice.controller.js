const db = require("../models");
const User = db.User;
const Op = db.Sequelize.Op;
const { genSaltSync, hashSync } = require("bcrypt");
const {  createUser, createAgent, updateUser,updateAgent, findAllAgent, findDetailAgent} = require("../services/backoffice.service")
const dbkey = require("../config/db.config")
const {TrackEvent} =require('../services/global.service')


exports.createUser = (req, res) => {
    // Validate request
    if (!req.body.UserName) {
        res.status(400).send({
            message: "UserName harus diisi"
        });
        return ;
    }

    // Create a Post
    const salt = genSaltSync(10);
    let HasPassword = hashSync(req.body.Password, salt);
    const post = {
        UserID : req.body.UserID,
        UserName: req.body.UserName,
        AgentID: req.body.AgentID,
        Password: HasPassword,
        Role: req.body.Role,
        isActive : 1,
        ExpiryDate : req.body.ExpiryDate,
        TerminateDate : req.body.TerminateDate,
        isLockOut : req.body.isLockOut
    };

    // Save Post in the database
    createUser(post,(err,results)=>{
        if (err) {
            return res.json({
                success: 0,
                message: "Gagal Create User",
                error : err
            });
        }
        else{
            res.status(200).send({
                results
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
        return ;
    }
    // Save Post in the database
    updateUser(req.body,(err,results)=>{
        if (err) {
            return res.json({
                success: 0,
                message: "Gagal Update User",
                error : err
            });
        }
        else{
            res.status(200).send({
                success: 1,
                message: "Sukses Update User",
                data : results
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
        return ;
    }
    // Save Post in the database
    updateAgent(req.body,(err,results)=>{
        if (err) {
            return res.json({
                success: 0,
                message: "Gagal Update Agent",
                error : err
            });
        }
        else{
            res.status(200).send({
                success: 1,
                message: "Sukses Update Agent",
                data : results
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
        return ;
    }

    var IDType = {"KTP": "1", "Passport": "2"}

    // Create a Post
    const post = {
        Name : req.body.Name,
        IDType: IDType[req.body.IDType],
        Branch: req.body.Branch,
        ProfileID:req.body.ProfileID,
        IDNo: req.body.IDNo, 
        PhoneNo: req.body.PhoneNo, 
        Email : req.body.Email,
        Company : req.body.Company,
        NPWP : req.body.NPWP,
        Bank : req.body.Bank,
        AccountNo : req.body.AccountNo,
        Address : req.body.Address,
        City : req.body.City,
        Status : "1",
        JoinedDate : req.body.JoinedDate,
        Type : "1",
        Address : req.body.Address
    };

    // Save Post in the database
    createAgent(post,(err,results)=>{
        if (err) {
            return res.json({
                success: 0,
                message: "Gagal Create Agent",
                error : err
            });
        }
        else{
            res.status(200).send({
                results
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
exports.findDetailAgent = async (req, res) => {
    try {
        if (!req.body.AgentID) {
            res.status(400).send({
                message: "AgentID harus diisi"
            });
            return ;
        }
        const AgentDetail = await findDetailAgent(req.body.AgentID);

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