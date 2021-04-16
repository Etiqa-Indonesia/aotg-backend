const db = require("../models");
const User = db.User;
const Op = db.Sequelize.Op;
const { genSaltSync, hashSync, compare } = require("bcrypt");
const { getLoginUser, createUser, 
    getUserByPK, getLoginUserJoin , createAgent} = require("../services/user.service")
const { sign } = require("jsonwebtoken");
const dbkey = require("../config/db.config")


// Create and Save a new Post
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
        Role: req.body.Role 
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
        JoinedDate : req.body.JoinedDate
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

exports.findUser = (req, res) => {
    const id = req.params.id;
    
    getUserByPK(id, (err, results)=>{
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


exports.getLogin =(req, res) => {
    const UserName = req.body.UserName;
    const password = req.body.Password;
    let condition = {
                     UserName : UserName,
                     IsActive : 1
                    }

    getLoginUserJoin(condition,(err, results) => {
        if (err) {
            return res.json({
                success: 0,
                message: "User atau Password salah"
            });
        }
        else{
            compare(password,  results.Password, function(err, match) {
                if (err) throw new Error(err);
                else if (match == false) {
                    return res.json({
                        success: false,
                        message: 'User atau Password salah',
                        data : results
                    })
                } else {
                    // const result = null;
                    results.Password = undefined;
                    const toToken = results.AgentID + results.UserID;

                    const jsontoken =sign({toToken}, dbkey.key, {
                        expiresIn: "1h"
                    });
                    return res.json({
                        succes: true,
                        message: "Sukses Login",
                        user : results,
                        token : jsontoken
                    })
                }
            });
        }
        
        
    });
};