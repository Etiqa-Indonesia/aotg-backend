const { getListCustomer } = require('../services/customer.service')


exports.getListCustomer = async (req, res) => {
    var customerName = null;
    if (req.body.name != null || req.body.name =="") {
        customerName = req.body.name;
    }
    const data = {
        AgentID : req.params.id,
        CustomerName : customerName
    }
    //console.log(data);
    getListCustomer(data, (err, results)=>{
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