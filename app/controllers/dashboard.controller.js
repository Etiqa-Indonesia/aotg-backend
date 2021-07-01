const {getMotorDashboard , getMotorQuote} = require('../services/dashboard.service');
const {motorproductid} = require('../config/db.config')

exports.getMotorDashboard = async (req, res) => {
    const data = {
        AgentID : req.params.agentid,
        TOC : motorproductid
    }
    const Role = req.params.role
    getMotorDashboard(data, Role, (err, results)=>{
        if (err) {
            return res.status(500).send({
                message: "Error Retrieving Data",
                error: err

            });
        } else {
            res.status(200).send({
                results
            })
        }

    });
};

exports.getMotorQuote = async (req, res) => {
    const data = {
        AgentID : req.params.agentid,
        Status : req.body.status,
        TOC : motorproductid
    }
    const Role = req.params.role
    getMotorQuote(data,Role, (err, results)=>{
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

}