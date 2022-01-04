const { CountInvoiceListBO, getSummaryAgentDetail,getSummaryAgentList } = require('../../services/backoffice/invoiceBO.service')

exports.CountInvoiceListBO = async (req, res) => {
    console.log(req.query.agentid)
    const agentid = (req.query.agentid == undefined || req.query.agentid == '' ? null : req.query.agentid)
    const datasend = {
        TOC: req.params.TOC,
        AgentID: agentid
    }
    const results = await CountInvoiceListBO(
        datasend
    )
    res.status(200).send({
        'code': '200',
        'message': 'Success',
        'data': results
    })

};

exports.getSummaryAgentList = async (req, res) => {
    const page = (req.query.page == undefined || req.query.page == 0 ? 0 : req.query.page)
    try {
        const data = await getSummaryAgentList(req.body, page)
        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': data
        })
    } catch (error) {
        res.status(200).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
    
}

exports.getSummaryAgentDetail = async (req, res) => {
    try {
        const data = await getSummaryAgentDetail(req.params.id)
        res.status(200).send({
            'code': '200',
            'message': 'Success',
            'data': data
        })
    } catch (error) {
        res.status(200).send({
            'code': '400',
            'message': 'Error',
            'data': error
        })
    }
    
}