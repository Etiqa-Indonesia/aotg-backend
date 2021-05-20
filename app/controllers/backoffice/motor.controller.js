const {getMotorDashboard, getMotorQuote} = require('../../services/backoffice/motor.service')
const {motorproductid} = require('../../config/db.config')

exports.getMotorDashboard = async (req, res) => {
    const data = {
        TOC : motorproductid,
        Role : req.params.role
    }
    getMotorDashboard(data, (err, results)=>{
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

exports.getMotorQuote = async (req, res) => {
    if (!req.body.Status) {
        res.status(400).send({
            message: "Status harus diisi"
        });
        return ;
    }
    const data = {
        Status : req.body.Status,
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