const {getMotorDashboard, getMotorQuote} = require('../../services/backoffice/motor.service')
const {findAllRateCode} = require('../../services/rate.service')
const {findAllVehicleType} = require('../../services/vehicletype.service')
const {motorproductid} = require('../../config/db.config')

exports.getMotorDashboard = async (req, res) => {
    if (req.params.role =='A') {
        res.status(400).send({
            message: "Role Anda Bukan Marketing"
        });
        return ;
    }
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

exports.findAllRateCode = async (req, res) => {
    try {
        const RateCode = await findAllRateCode();

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': RateCode
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};

exports.findAllVehicleType = async (req, res) => {
    try {
        const vehicletype = await findAllVehicleType();

        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': vehicletype
        })
    } catch (error) {
        res.status(400).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
};

exports.getMotorQuote = async (req, res) => {
    if (!req.params.status) {
        res.status(400).send({
            message: "Status harus diisi"
        });
        return ;
    }
    if (req.params.role =='A') {
        res.status(400).send({
            message: "Role Anda Bukan Marketing"
        });
        return ;
    }
    // const page = parseInt(req.query.page || 0)
    const data = {
        Status : req.params.status,
        TOC : motorproductid
    }
    const Role = req.params.role
    getMotorQuote(data,Role, (err, results)=>{
        if (err) {
            return res.status(500).send({
                message: "Error Retrieving Data",

            });
        } else {
            res.status(200).send({
                results
            })
        }

    });

}